"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HeroCopy() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.p
        variants={fadeUp}
        style={{
          marginTop: 24,
          color: "#A1A1AA",
          fontSize: 15,
          lineHeight: 1.6,
          maxWidth: 400,
          fontFamily: "Switzer, sans-serif",
        }}
      >
        Your bookmarks, Watch Later, and saved posts are scattered across ten
        apps&mdash;collecting dust instead of building skills. Cached turns that
        backlog into a scheduled learning plan that syncs with your calendar.
      </motion.p>

      <motion.div variants={fadeUp} style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <Link
          href="#vault"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 24px 10px",
            background: "#06D6A0",
            color: "#09090B",
            fontSize: 16,
            fontWeight: 500,
            borderRadius: 32,
            border: "2px solid transparent",
            whiteSpace: "nowrap",
            textDecoration: "none",
            fontFamily: "Switzer, sans-serif",
          }}
        >
          Preview Vault Sample
        </Link>

        <Link
          href="#how-it-works"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 24px 10px",
            background: "#27272A",
            color: "#FAFAFA",
            fontSize: 16,
            fontWeight: 500,
            borderRadius: 32,
            border: "2px solid rgba(255,255,255,0.06)",
            whiteSpace: "nowrap",
            textDecoration: "none",
            fontFamily: "Switzer, sans-serif",
          }}
        >
          See How It Works
        </Link>
      </motion.div>
    </motion.div>
  );
}
