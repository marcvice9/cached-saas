import type Stripe from "stripe";

export const STRIPE_CONFIG = {
  proPriceId: process.env.STRIPE_PRO_PRICE_ID || "",
} as const;

function isStripePriceId(value: string): boolean {
  return /^price_[A-Za-z0-9]+$/.test(value);
}

export async function resolveProPriceId(stripe: Stripe): Promise<string> {
  const configured = STRIPE_CONFIG.proPriceId.trim();

  if (!configured) {
    throw new Error(
      "Missing STRIPE_PRO_PRICE_ID. Set it to a Stripe price ID like price_..."
    );
  }

  if (isStripePriceId(configured)) {
    return configured;
  }

  const byLookupKey = await stripe.prices.list({
    lookup_keys: [configured],
    active: true,
    limit: 1,
  });
  if (byLookupKey.data[0]?.id) {
    return byLookupKey.data[0].id;
  }

  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
    expand: ["data.product"],
  });
  const normalized = configured.toLowerCase();

  const byProductOrNickname = prices.data.find((price) => {
    const nickname = price.nickname?.toLowerCase();
    const productName =
      typeof price.product === "string"
        ? undefined
        : !("deleted" in price.product) && typeof price.product.name === "string"
          ? price.product.name.toLowerCase()
          : undefined;
    return nickname === normalized || productName === normalized;
  });

  if (byProductOrNickname?.id) {
    return byProductOrNickname.id;
  }

  throw new Error(
    `Invalid STRIPE_PRO_PRICE_ID "${configured}". Use a valid Stripe price ID (price_...).`
  );
}

export const PLAN_FEATURES = {
  FREE: {
    name: "Free",
    maxCategories: 2,
    aiSummaries: false,
    emailDigest: false,
    analytics: false,
  },
  PRO: {
    name: "Pro",
    maxCategories: Infinity,
    aiSummaries: true,
    emailDigest: true,
    analytics: true,
  },
} as const;
