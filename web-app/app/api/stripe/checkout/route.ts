import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { resolveProPriceId } from "@/lib/stripe/config";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("email, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create or reuse Stripe customer
  let customerId = userData?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData?.email || user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  let session;
  try {
    const proPriceId = await resolveProPriceId(stripe);
    session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: proPriceId, quantity: 1 }],
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/app?checkout=cancel`,
      metadata: { supabase_user_id: user.id },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ url: session.url });
}
