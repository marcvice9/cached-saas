"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type ChaosItem =
  | {
      type: "icon";
      id: string;
      color: string;
      size: number;
      delay: number;
      targetX: number; // in %
      targetY: number; // px from top of panel
      targetR: number; // deg
    }
  | {
      type: "text";
      text: string;
      delay: number;
      targetX: number;
      targetY: number;
      targetR: number;
      width: number;
    };

const CHAOS_ITEMS: ChaosItem[] = [
  { type: "icon", id: "yt", color: "#ff0000", size: 58, delay: 0.12, targetX: 12, targetY: 120, targetR: -8 },
  { type: "icon", id: "x", color: "#0f1419", size: 54, delay: 0.48, targetX: 68, targetY: 96, targetR: 10 },
  { type: "icon", id: "gh", color: "#24292f", size: 52, delay: 0.84, targetX: 34, targetY: 176, targetR: -12 },
  { type: "icon", id: "sp", color: "#1db954", size: 56, delay: 1.2, targetX: 56, targetY: 228, targetR: 6 },
  { type: "icon", id: "li", color: "#0a66c2", size: 52, delay: 1.56, targetX: 18, targetY: 262, targetR: -5 },
  { type: "icon", id: "bm", color: "#f59e0b", size: 46, delay: 1.92, targetX: 72, targetY: 294, targetR: 14 },
  { type: "icon", id: "nl", color: "#7c3aed", size: 48, delay: 2.28, targetX: 42, targetY: 334, targetR: -16 },
  { type: "text", text: "Where is that link?", delay: 2.64, targetX: 8, targetY: 384, targetR: -4, width: 170 },
  { type: "text", text: "DMs to myself", delay: 3.0, targetX: 52, targetY: 410, targetR: 6, width: 150 },
  { type: "text", text: "Different tabs", delay: 3.36, targetX: 20, targetY: 452, targetR: -5, width: 140 },
  { type: "text", text: "Bookmarked", delay: 3.72, targetX: 60, targetY: 466, targetR: 5, width: 130 },
];

const CAL_EVENTS = [
  { time: "9:00 AM", title: "Deep Work" },
  { time: "11:15 AM", title: "Finish SQL course" },
  { time: "12:30 PM", title: "Learn Python" },
  { time: "4:00 PM", title: "Repo walkthrough" },
];

const FRUSTRATIONS = [
  "Forgot to watch",
  "Where is that link?",
  "100+ unread",
  "Different tabs",
  "DMs to myself",
];

function ChaosLabelIcon({ text }: { text: string }) {
  if (text === "DMs to myself") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M21 3L10 14" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 3L14 21L10 14L3 10L21 3Z" stroke="#3F3F46" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (text === "Bookmarked") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 4.5C7 3.67 7.67 3 8.5 3H15.5C16.33 3 17 3.67 17 4.5V21L12 17.6L7 21V4.5Z" fill="#52525B" />
      </svg>
    );
  }

  if (text === "Where is that link?") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M10 14L14 10" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
        <path d="M7.5 16.5L5.5 18.5C4.12 19.88 4.12 22.12 5.5 23.5C6.88 24.88 9.12 24.88 10.5 23.5L12.5 21.5" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.5 7.5L18.5 5.5C19.88 4.12 22.12 4.12 23.5 5.5C24.88 6.88 24.88 9.12 23.5 10.5L21.5 12.5" stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (text === "Different tabs") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="5" width="14" height="12" rx="2" fill="#71717A" />
        <rect x="8" y="8" width="12" height="11" rx="2" fill="#52525B" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="#71717A" />
      <path d="M12 7V12L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BrandIcon({ id, color, size }: { id: string; color: string; size: number }) {
  const common = "absolute flex items-center justify-center rounded-full bg-white shadow-lg";
  const iconSize = size - 14;

  return (
    <div
      className={`${common}`}
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
      }}
    >
      {id === "yt" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="3" fill={color} />
          <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="white" />
        </svg>
      )}
      {id === "x" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5.5L18.5 20M19 5L5 19.5"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {id === "gh" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5c-5.3 0-9.5 4.2-9.5 9.5 0 4.2 2.7 7.8 6.5 9.1v-2.9c0-.6.5-1.2 1.1-1.4A1.5 1.5 0 0011 14v-.3c-2.9.7-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6-1 1.6-1 .9-1.7 2.3-1.2 2.9-.9.1-.7.5-1.2.9-1.5-2.3-.3-4.7-1.2-4.7-5.3 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1.8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c1.9-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 2.9 0 4.1-2.4 5-4.7 5.3.5.4 1 1.2 1 2.5V21c3.8-1.3 6.5-4.9 6.5-9 0-5.3-4.3-9.5-9.5-9.5Z"
            fill={color}
          />
        </svg>
      )}
      {id === "sp" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill={color} />
          <path
            d="M7 10.2c3.1-1 6.6-.6 9.4.8M8 13c2.4-.8 5.2-.6 7.4.5M9 15.6c1.8-.6 3.9-.5 5.6.3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {id === "li" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2.5" fill={color} />
          <circle cx="8" cy="9" r="1.5" fill="white" />
          <rect x="7" y="11" width="2" height="6" rx=".6" fill="white" />
          <rect x="11" y="9" width="2" height="8" rx=".6" fill="white" />
          <path d="M18 17h-2v-3.2c0-.9-.5-1.4-1.2-1.4-.7 0-1.3.5-1.3 1.4V17h-2v-8h2v.9c.4-.6 1.1-1 1.9-1 1.6 0 2.6 1 2.6 2.8V17Z" fill="white" />
        </svg>
      )}
      {id === "bm" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M6 4.5C6 3.7 6.7 3 7.5 3h9c.8 0 1.5.7 1.5 1.5v15l-6-3.3-6 3.3v-15Z"
            fill={color}
          />
        </svg>
      )}
      {id === "nl" && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" fill={color} />
          <path d="M5 8h14M5 11.5h10M5 15h7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

export default function BeforeAfterVisual() {
  // Shared timing so chaos → funnel → timeline stays in sync.
  const cycleTotal = 20;      // full loop duration (s)
  const fallDuration = 2.1;   // full drop-in window
  const pulseAt = 6.2;        // center pulse kicks suction
  const fadeDuration = 1.2;   // pull-in window
  const timelineStart = pulseAt + 0.35; // right panel starts right after suction begins
  const timelineDuration = 7; // cards visible window

  return (
    <div className="relative isolate">
      <div className="relative grid overflow-hidden rounded-[32px] border border-white/8 bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:grid-cols-2">
        {/* Left: Chaos */}
        <div className="relative h-[520px] overflow-hidden bg-gradient-to-br from-[#FAFAFA] via-[#F4F4F5] to-[#E4E4E7]">
          <motion.div
            className="absolute inset-0"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.045 } },
            }}
          >
            {CHAOS_ITEMS.map((item, i) => {
              const driftX = 6 - i * 0.8; // slight sideways drift per piece
              const startY = item.type === "icon" ? -700 : -520;
              const fallEnd = fallDuration / cycleTotal;
              const floatMid = (pulseAt - 0.6) / cycleTotal;
              const floatEnd = pulseAt / cycleTotal;
              const suctionEnd = (pulseAt + fadeDuration) / cycleTotal;

              return (
                <motion.div
                  key={item.type === "icon" ? item.id : item.text}
                  className="absolute"
                  style={{
                    left: `${item.targetX}%`,
                    top: "-120px",
                    zIndex: i,
                  }}
                  initial={{ opacity: 1, y: startY, rotate: -14, scale: 0.8 }}
                  animate={{
                    opacity: [1, 1, 1, 1, 0],
                    x: [0, driftX, driftX + 2, driftX, 50 - item.targetX],
                    y: [
                      startY,
                      item.targetY,
                      item.targetY - 6,
                      item.targetY,
                      140,
                    ],
                    rotate: [-14, item.targetR, item.targetR - 2, item.targetR, 4],
                    scale: [0.86, 1, 1.02, 1, 0],
                  }}
                  transition={{
                    delay: item.delay,
                    duration: cycleTotal,
                    times: [
                      0,
                      fallEnd,
                      floatMid,
                      floatEnd,
                      suctionEnd,
                    ],
                    ease: ["easeOut", "easeInOut", "linear", [0.32, 0, 0.67, 0]],
                    repeat: Infinity,
                    repeatDelay: 0,
                  }}
                >
                  {item.type === "icon" ? (
                    <BrandIcon id={item.id} color={item.color} size={item.size} />
                  ) : (
                    <div
                      className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-zinc-800 shadow-[0_10px_24px_rgba(24,24,27,0.25)] ring-1 ring-zinc-300"
                      style={{ minWidth: item.width }}
                    >
                      <ChaosLabelIcon text={item.text} />
                      {item.text}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Dusty ground to emphasize the pile */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#D4D4D8] via-[#E4E4E7]/80 to-transparent blur-[1px]" />
          </motion.div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-6 top-10 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-700">
              Your Digital Chaos
            </div>
          </div>
        </div>

        {/* Center connector */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/80 shadow-[0_10px_60px_rgba(0,0,0,0.2)] backdrop-blur"
            animate={{
              scale: [1, 0.92, 1],
              boxShadow: [
                "0 0 0 0 rgba(6,214,160,0.45)",
                "0 0 0 16px rgba(6,214,160,0)",
                "0 0 0 0 rgba(6,214,160,0)",
              ],
            }}
            transition={{
              duration: 1.4,
              delay: pulseAt,
              repeat: Infinity,
              repeatDelay: cycleTotal - 1.4,
              ease: "easeOut",
            }}
          >
            <Image
              src="/logo_v3.jpg"
              alt="Cached logo"
              fill
              sizes="96px"
              className="object-contain"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,_rgba(6,214,160,0.25),_rgba(6,214,160,0.1),_transparent_60%)] blur-lg" />
          </motion.div>
        </div>

        {/* Right: Structured calendar */}
        <div className="relative h-[520px] overflow-hidden bg-gradient-to-br from-[#06D6A0] via-[#34D8B0] to-[#86E7CC]">
          <div className="absolute left-6 top-10 text-xs font-semibold uppercase tracking-[0.1em] text-[#064E3B]">
            Your Structured Growth
          </div>

          <div className="absolute right-6 top-16 flex flex-col gap-3">
            {CAL_EVENTS.map((event, idx) => (
              <motion.div
                key={event.time}
                className="relative flex min-w-[240px] items-center gap-3 overflow-hidden rounded-2xl border border-white/50 bg-white/85 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
                initial={{ opacity: 0, x: 26, y: -18, scale: 0.96 }}
                animate={{
                  opacity: [0, 0, 1, 1, 0],
                  x: [26, 26, 0, 0, 0],
                  y: [-18, -18, 0, 0, 10],
                  scale: [0.96, 0.96, 1, 1, 0.98],
                }}
                transition={{
                  delay: timelineStart + idx * 0.32,
                  duration: timelineDuration + 4,
                  ease: ["linear", "easeOut", "linear", [0.32, 0, 0.67, 0]],
                  times: [0, 0.2, 0.35, 0.9, 1],
                  repeat: Infinity,
                  repeatDelay: cycleTotal - (timelineDuration + 4),
                }}
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#06D6A0] text-[#064E3B] leading-none">
                  <span className="text-[10px] font-semibold">{event.time.split(" ")[0]}</span>
                  <span className="mt-[2px] text-[8px] font-semibold tracking-[0.06em]">{event.time.split(" ")[1]}</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-[13px] font-semibold text-zinc-900">{event.title}</p>
                  <p className="text-[12px] text-zinc-600">Scheduled by Cached</p>
                </div>

                {/* subtle scanner light */}
                <motion.div
                  className="pointer-events-none absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/18 to-transparent"
                  style={{ left: -60 }}
                  animate={{ left: ["-60px", "260px"] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "linear", delay: 0.8 + idx * 0.2 }}
                />

                {/* conversion pulse on Learn Python block */}
                {event.title === "Learn Python" && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-2xl border border-[#06D6A0]/30"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(6,214,160,0.5)",
                        "0 0 0 12px rgba(6,214,160,0)",
                        "0 0 0 0 rgba(6,214,160,0)",
                      ],
                    }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeOut", delay: 2.4 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Label overlays at bottom for clarity */}
      <div className="mt-4 flex items-center justify-between text-xs font-medium text-zinc-500">
        <span>Scattered saves across ten apps</span>
        <span className="text-zinc-400">Cached funnels → schedules → syncs</span>
        <span className="text-zinc-300">Calendar-ready learning blocks</span>
      </div>
    </div>
  );
}
