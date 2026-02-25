"use client";

import { motion } from "framer-motion";

const ROWS = [
  {
    old: {
      title: "Fragmentation",
      desc: "Bookmarks in Chrome, Watch Later on YouTube, saves on LinkedIn, stars on GitHub",
    },
    new: {
      title: "Unified Stream",
      desc: "One feed for every link, video, and post you\u2019ve saved",
    },
  },
  {
    old: {
      title: "Context Loss",
      desc: "You saved it for a reason, but two weeks later you forgot why",
    },
    new: {
      title: "Goal-Aware",
      desc: "Tag resources to learning paths so the \u201cwhy\u201d is always visible",
    },
  },
  {
    old: {
      title: "Time Mismatch",
      desc: "No dedicated time means it never happens",
    },
    new: {
      title: "Auto-Matched to Calendar",
      desc: "Cached finds open slots and schedules your learning",
    },
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function PainVsSolution() {
  return (
    <section
      style={{
        background: "#09090B",
        padding: "80px 24px 96px",
        fontFamily: "Switzer, sans-serif",
      }}
    >
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: "#FAFAFA",
          textAlign: "center",
          letterSpacing: "-1.5px",
          marginBottom: 56,
        }}
      >
        Saved &ne; Scheduled
      </motion.h2>

      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {/* Column headers */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          style={{
            fontSize: 14,
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
            color: "#71717A",
            paddingBottom: 8,
          }}
        >
          Old Way
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          style={{
            fontSize: 14,
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
            color: "#06D6A0",
            paddingBottom: 8,
          }}
        >
          Cached Way
        </motion.div>

        {ROWS.map((row, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: i * 0.1 } },
            }}
            style={{ display: "contents" }}
          >
            {/* Old Way card */}
            <motion.div
              variants={fadeUp}
              style={{
                background: "#18181B",
                borderRadius: 16,
                padding: "24px 28px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#71717A",
                  marginBottom: 6,
                }}
              >
                {row.old.title}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "#A1A1AA" }}>
                {row.old.desc}
              </p>
            </motion.div>

            {/* Cached Way card */}
            <motion.div
              variants={fadeUp}
              style={{
                background: "#18181B",
                borderRadius: 16,
                padding: "24px 28px",
                border: "1px solid rgba(6,214,160,0.15)",
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#06D6A0",
                  marginBottom: 6,
                }}
              >
                {row.new.title}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "#D4D4D8" }}>
                {row.new.desc}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
