"use client";

import { useState } from "react";
import type { PlanInfo } from "@/lib/types/api";

const PLAN_FEATURES = {
  FREE: {
    name: "Free",
    price: "0€",
    features: [
      "Up to 2 categories",
      "Limited AI summaries",
      "Unlimited content saves",
      "Weekly schedule generation",
      "Learning slots",
      "Analytics dashboard",
      "Priority support",
    ],
    limitations: [],
  },
  PRO: {
    name: "Pro",
    price: "14.99€/mo",
    features: [
      "Unlimited categories",
      "Unlimited AI summaries",
      "Send email schedules",
      "Everything in Free",
    ],
    limitations: [],
  },
};

export default function BillingPanel({
  planInfo,
}: {
  planInfo: PlanInfo;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to open billing portal");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Current Plan Banner */}
      <div className="mb-6 rounded-xl bg-brand-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Current Plan</p>
            <p className="text-xl font-bold text-white">
              {planInfo.plan === "PRO" ? "Pro" : "Free"}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              planInfo.plan === "PRO"
                ? "bg-brand-teal/10 text-brand-teal"
                : "bg-brand-gray text-zinc-300"
            }`}
          >
            {planInfo.plan}
          </span>
        </div>

        {planInfo.plan === "PRO" && planInfo.currentPeriodEnd && (
          <p className="mt-2 text-sm text-zinc-400">
            {planInfo.cancelAtPeriodEnd
              ? `Cancels on ${new Date(planInfo.currentPeriodEnd).toLocaleDateString()}`
              : `Renews on ${new Date(planInfo.currentPeriodEnd).toLocaleDateString()}`}
          </p>
        )}

        {planInfo.plan === "PRO" && (
          <button
            onClick={handleManage}
            disabled={loading}
            className="mt-3 rounded-lg bg-brand-gray px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50"
          >
            Manage Subscription
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Plan Comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(["FREE", "PRO"] as const).map((plan) => {
          const info = PLAN_FEATURES[plan];
          const isCurrent = planInfo.plan === plan;

          return (
            <div
              key={plan}
              className={`rounded-xl bg-brand-surface p-5 shadow-sm ${
                plan === "PRO" ? "ring-2 ring-brand-teal" : ""
              }`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">
                  {info.name}
                </h3>
                <p className="text-2xl font-bold text-white">
                  {info.price}
                </p>
              </div>

              <ul className="space-y-2">
                {info.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-200"
                  >
                    <svg
                      className="mt-0.5 flex-shrink-0 text-green-500"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
                {info.limitations.map((limitation, i) => (
                  <li
                    key={`limit-${i}`}
                    className="flex items-start gap-2 text-sm text-zinc-500"
                  >
                    <svg
                      className="mt-0.5 flex-shrink-0 text-zinc-600"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {limitation}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <span className="block w-full rounded-lg border border-white/10 bg-brand-gray py-2.5 text-center text-sm font-medium text-zinc-400">
                    Current Plan
                  </span>
                ) : plan === "PRO" ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="block w-full rounded-lg bg-brand-teal py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Upgrade to Pro"}
                  </button>
                ) : (
                  <span className="block w-full rounded-lg border border-white/10 bg-brand-gray py-2.5 text-center text-sm font-medium text-zinc-400">
                    Free Forever
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
