"use server";

import { createClient } from "@/lib/supabase/server";
import type { PlanInfo } from "@/lib/types/api";
import type { Plan } from "@/lib/types/database";
import { FEATURE_GATES } from "@/lib/constants";
import { getEffectivePlan } from "@/lib/billing/effective-plan";
import { getStripeClient } from "@/lib/stripe/client";

function toIsoFromUnix(value?: number): string {
  const timestamp = value ?? Math.floor(Date.now() / 1000);
  return new Date(timestamp * 1000).toISOString();
}

function getSubscriptionPeriod(
  sub: Record<string, unknown>
): { periodStart: string; periodEnd: string } {
  const start =
    (sub.current_period_start as number) || (sub.created as number) || Date.now() / 1000;
  const end =
    (sub.current_period_end as number) || start + 30 * 86400;
  return {
    periodStart: toIsoFromUnix(start),
    periodEnd: toIsoFromUnix(end),
  };
}

export async function getPlanInfo(): Promise<PlanInfo> {
  if (process.env.DISABLE_AUTH === "true") {
    return {
      plan: "PRO" as Plan,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const plan = (await getEffectivePlan(supabase, user.id)) as Plan;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("cancel_at_period_end, current_period_end")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .single();

  return {
    plan,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    currentPeriodEnd: subscription?.current_period_end ?? null,
  };
}

export async function checkFeatureAccess(
  feature: keyof (typeof FEATURE_GATES)["FREE"]
): Promise<boolean> {
  if (process.env.DISABLE_AUTH === "true") {
    return true;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const plan = (await getEffectivePlan(supabase, user.id)) as Plan;
  return !!FEATURE_GATES[plan][feature];
}

export async function syncCurrentUserStripeSubscription(): Promise<void> {
  if (process.env.DISABLE_AUTH === "true") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!userData?.stripe_customer_id) return;

  const stripe = getStripeClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: userData.stripe_customer_id,
    status: "all",
    limit: 10,
  });

  const latest = subscriptions.data
    .filter((sub) =>
      ["active", "trialing", "past_due"].includes(sub.status)
    )
    .sort((a, b) => b.created - a.created)[0];

  if (!latest) return;
  const latestRaw = latest as unknown as Record<string, unknown>;
  const { periodStart, periodEnd } = getSubscriptionPeriod(latestRaw);

  const mappedStatus: "ACTIVE" | "PAST_DUE" | "TRIALING" =
    latest.status === "past_due"
      ? "PAST_DUE"
      : latest.status === "trialing"
        ? "TRIALING"
        : "ACTIVE";

  await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      stripe_subscription_id: latest.id,
      status: mappedStatus,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: latest.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" }
  );

  await supabase
    .from("users")
    .update({ plan: "PRO" })
    .eq("id", user.id);
}
