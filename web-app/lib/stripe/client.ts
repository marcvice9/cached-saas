import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripe;
}
