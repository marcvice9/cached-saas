"use client";

import { motion } from "framer-motion";

export default function HeroBackground({ videoSrc }: { videoSrc?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: 732,
        top: 155,
        width: 566,
        height: 566,
        borderRadius: 370,
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "conic-gradient(from 0deg, rgb(238, 86, 34), rgb(247, 160, 80), rgb(247, 246, 244), rgb(238, 86, 34))",
            animation: "heroGradientRotate 6s linear infinite",
          }}
        />
      )}

      <style jsx>{`
        @keyframes heroGradientRotate {
          from {
            transform: rotate(0deg) scale(1.5);
          }
          to {
            transform: rotate(360deg) scale(1.5);
          }
        }
      `}</style>
    </motion.div>
  );
}
