"use client";

import { motion } from "framer-motion";

/** Wavy path definitions — each has two states for the morph animation */
const wavyPaths = [
  {
    y: 180,
    d1: "M0,180 C200,160 400,200 600,175 C800,150 1000,195 1200,180 C1400,165 1440,185 1440,185",
    d2: "M0,185 C200,200 400,165 600,190 C800,175 1000,155 1200,185 C1400,195 1440,170 1440,170",
  },
  {
    y: 360,
    d1: "M0,360 C180,340 420,380 640,355 C860,330 1020,375 1220,360 C1380,345 1440,365 1440,365",
    d2: "M0,365 C180,385 420,345 640,370 C860,355 1020,335 1220,365 C1380,380 1440,350 1440,350",
  },
  {
    y: 540,
    d1: "M0,540 C220,520 380,560 620,535 C840,510 1040,555 1240,540 C1360,525 1440,545 1440,545",
    d2: "M0,545 C220,565 380,525 620,550 C840,535 1040,515 1240,545 C1360,560 1440,530 1440,530",
  },
  {
    y: 720,
    d1: "M0,720 C240,700 440,740 660,715 C880,690 1060,735 1260,720 C1400,705 1440,725 1440,725",
    d2: "M0,725 C240,745 440,705 660,730 C880,715 1060,695 1260,725 C1400,740 1440,710 1440,710",
  },
];

const GRID_SPACING = 50;
const SVG_W = 1440;
const SVG_H = 886;

export default function HeroNetBackground() {
  const hLines = Math.floor(SVG_H / GRID_SPACING);
  const vLines = Math.floor(SVG_W / GRID_SPACING);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        maskImage:
          "radial-gradient(ellipse 60% 70% at 75% 50%, black 0%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 70% at 75% 50%, black 0%, transparent 100%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid — horizontal lines */}
        {Array.from({ length: hLines }, (_, i) => {
          const y = (i + 1) * GRID_SPACING;
          return (
            <line
              key={`h${i}`}
              x1={0}
              y1={y}
              x2={SVG_W}
              y2={y}
              stroke="#0f172a"
              strokeOpacity={0.05}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Grid — vertical lines */}
        {Array.from({ length: vLines }, (_, i) => {
          const x = (i + 1) * GRID_SPACING;
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={SVG_H}
              stroke="#0f172a"
              strokeOpacity={0.05}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Wavy mesh paths */}
        {wavyPaths.map((p, i) => (
          <motion.path
            key={i}
            fill="none"
            stroke="rgb(238,86,34)"
            strokeOpacity={0.15}
            strokeWidth={0.5}
            initial={{ d: p.d1 }}
            animate={{ d: [p.d1, p.d2] }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: i * 1.5,
            }}
            style={{ willChange: "d" }}
          />
        ))}
      </svg>
    </div>
  );
}
