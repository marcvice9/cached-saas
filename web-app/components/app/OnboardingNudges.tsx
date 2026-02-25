"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function OnboardingNudges({
  hasCategories,
  hasSlots,
}: {
  hasCategories: boolean;
  hasSlots: boolean;
}) {
  if (hasCategories && hasSlots) return null;

  const nudges = [
    !hasCategories && {
      title: "Create your first category",
      description:
        "Categories help organize your saved content by topic or goal.",
      href: "/app/categories",
      cta: "Add categories",
    },
    !hasSlots && {
      title: "Set up learning slots",
      description:
        "Define when you're available to learn so we can build your schedule.",
      href: "/app/slots",
      cta: "Add slots",
    },
  ].filter(Boolean) as {
    title: string;
    description: string;
    href: string;
    cta: string;
  }[];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {nudges.map((nudge, i) => (
        <motion.div
          key={nudge.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link
            href={nudge.href}
            className="block rounded-2xl border border-dashed border-white/20 bg-brand-surface p-5 transition-colors hover:border-brand-teal hover:bg-brand-teal/5"
          >
            <h3 className="font-semibold text-white">{nudge.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{nudge.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-brand-teal">
              {nudge.cta} &rarr;
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
