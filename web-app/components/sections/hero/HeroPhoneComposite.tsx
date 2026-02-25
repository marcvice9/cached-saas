"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroPhoneComposite() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <motion.div
      ref={ref}
      style={{
        position: "absolute",
        left: 697,
        top: -4,
        width: 624,
        height: 726,
        zIndex: 2,
        y: parallaxY,
      }}
    >
      {/* Inner wrapper for idle float animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        {/* Hand image (z-2) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 624,
            height: 726,
            zIndex: 2,
          }}
        >
          <Image
            src="https://framerusercontent.com/images/fnqQi7AU7bcBU3Sh4O7CNwIVOg.png"
            alt="App on phone"
            fill
            style={{ objectFit: "cover", objectPosition: "50% 50%" }}
            sizes="624px"
            priority
          />
        </div>

        {/* Phone screen clip container (z-3) */}
        <div
          style={{
            position: "absolute",
            left: 290.5,
            top: 43,
            width: 270,
            height: 567,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#F7F6F4",
            zIndex: 3,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 17.5,
              top: 46,
              width: 236,
              height: 91,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              src="https://framerusercontent.com/images/SeYRINWaPpxuNlp6Oh1XG2Ntwu8.png"
              alt="Attendees card"
              fill
              style={{ objectFit: "cover" }}
              sizes="236px"
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 17.5,
              top: 146,
              width: 236,
              height: 203,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              src="https://framerusercontent.com/images/bvrdc6XfeXONxOg5p44s3P288.png"
              alt="Person list card"
              fill
              style={{ objectFit: "cover" }}
              sizes="236px"
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 17.5,
              top: 358,
              width: 236,
              height: 281,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              src="https://framerusercontent.com/images/e65pO1Wovve2EYwXl5VUTlauLw.png"
              alt="Daily to-dos card"
              fill
              style={{ objectFit: "cover" }}
              sizes="236px"
            />
          </div>
        </div>

        {/* Phone frame overlay (z-4) */}
        <div
          style={{
            position: "absolute",
            left: 303,
            top: 42,
            width: 258,
            height: 571,
            zIndex: 4,
          }}
        >
          <Image
            src="https://framerusercontent.com/images/QFHUiQYEO1jPi9DDeusd3Ja5Ptk.png"
            alt="App UI"
            fill
            style={{ objectFit: "cover", objectPosition: "50% 50%" }}
            sizes="258px"
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
