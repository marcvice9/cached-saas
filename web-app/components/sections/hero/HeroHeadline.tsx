"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PAIRS = [
  { a: "videos", b: "learning" },
  { a: "articles", b: "focusing" },
  { a: "tutorials", b: "executing" },
  { a: "repos", b: "coding" },
];
const INTERVAL = 2000;

export default function HeroHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % PAIRS.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  const pair = PAIRS[index];

  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        color: "#FAFAFA",
        fontSize: "72px",
        fontWeight: 500,
        letterSpacing: "-2.5px",
        lineHeight: "82.8px",
        fontFamily: "Switzer, sans-serif",
      }}
    >
      Stop saving{" "}
      <span
        style={{
          display: "inline-block",
          minWidth: "9ch",
          verticalAlign: "bottom",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={pair.a}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            style={{
              display: "inline-block",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#FAFAFA",
            }}
          >
            {pair.a}
          </motion.span>
        </AnimatePresence>
      </span>
      <br />
      <span style={{ whiteSpace: "nowrap" }}>
      Start{" "}
      <span
        style={{
          display: "inline-block",
          minWidth: "10ch",
          verticalAlign: "bottom",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={pair.b}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            style={{
              display: "inline-block",
              fontWeight: 500,
              color: "#06D6A0",
            }}
          >
            {pair.b}
          </motion.span>
        </AnimatePresence>
      </span>
      </span>
    </motion.h1>
  );
}
