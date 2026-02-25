import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";

// Helper to extract period dates from subscription data.
// The 2026 Stripe API version may not expose current_period_start/end
// on the TS type, but they exist at runtime. Use a safe accessor.
function getSubscriptionPeriod(sub: Record<string, unknown>): {
  periodStart: string;
  periodEnd: string;
} {
  const start =
    (sub.current_period_start as number) || (sub.created as number) || Date.now() / 1000;
  const end =
    (sub.current_period_end as number) || start + 30 * 86400; // fallback: +30 days
  return {
    periodStart: new Date(start * 1000).toISOString(),
    periodEnd: new Date(end * 1000).toISOString(),
  };
}

async function resolveUserIdForSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  subRaw: Record<string, unknown>
): Promise<string | null> {
  const metadataUserId =
    typeof subRaw.metadata === "object" &&
    subRaw.metadata &&
    typeof (subRaw.metadata as Record<string, unknown>).supabase_user_id === "string"
      ? ((subRaw.metadata as Record<string, unknown>).supabase_user_id as string)
      : null;
  if (metadataUserId) return metadataUserId;

  const customerId = typeof subRaw.customer === "string" ? subRaw.customer : null;
  if (!customerId) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  return user?.id ?? null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId || !session.subscription) break;

      // Get subscription details (raw to avoid TS version issues)
      const subRaw = (await stripe.subscriptions.retrieve(
        session.subscription as string
      )) as unknown as Record<string, unknown>;

      const { periodStart, periodEnd } = getSubscriptionPeriod(subRaw);

      // Update user plan
      await supabase
        .from("users")
        .update({ plan: "PRO" })
        .eq("id", userId);

      // Create subscription record
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: subRaw.id as string,
          status: "ACTIVE",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: (subRaw.cancel_at_period_end as boolean) ?? false,
        },
        { onConflict: "stripe_subscription_id" }
      );
      break;
    }

    case "customer.subscription.updated": {
      const subRaw = event.data.object as unknown as Record<string, unknown>;
      const subscriptionId = subRaw.id as string;
      const stripeStatus = subRaw.status as Stripe.Subscription.Status;
      const userId = await resolveUserIdForSubscription(supabase, subRaw);
      if (!userId) break;

      const status = mapStripeStatus(stripeStatus);
      const { periodStart, periodEnd } = getSubscriptionPeriod(subRaw);

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: (subRaw.cancel_at_period_end as boolean) ?? false,
        },
        { onConflict: "stripe_subscription_id" }
      );

      const nextPlan = status === "CANCELED" ? "FREE" : "PRO";
      await supabase
        .from("users")
        .update({ plan: nextPlan })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const subRaw = event.data.object as unknown as Record<string, unknown>;
      const subscriptionId = subRaw.id as string;
      const userId = await resolveUserIdForSubscription(supabase, subRaw);
      if (!userId) break;

      await supabase
        .from("subscriptions")
        .update({ status: "CANCELED" })
        .eq("stripe_subscription_id", subscriptionId);

      await supabase
        .from("users")
        .update({ plan: "FREE" })
        .eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELED";
    case "trialing":
      return "TRIALING";
    default:
      return "ACTIVE";
  }
}
