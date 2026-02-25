type AmbientGlowLayerProps = {
  intensity?: "low" | "medium";
  className?: string;
};

export default function AmbientGlowLayer({
  intensity = "low",
  className = "",
}: AmbientGlowLayerProps) {
  const layerOpacity = intensity === "medium" ? "opacity-100" : "opacity-90";
  const pulseClass = intensity === "medium" ? "ambient-glow-pulse-medium" : "ambient-glow-pulse";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${layerOpacity} ${className}`}
      aria-hidden
    >
      <div
        className={`ambient-glow-blob ambient-glow-drift-a ${pulseClass} absolute left-[-8%] top-[8%] h-[280px] w-[280px] md:h-[340px] md:w-[340px] rounded-full`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(6,214,160,0.2) 0%, rgba(6,214,160,0.08) 45%, transparent 72%)",
          filter: "blur(90px)",
          animationDelay: "0s, 0s",
        }}
      />
      <div
        className={`ambient-glow-blob ambient-glow-drift-b ${pulseClass} absolute right-[-12%] top-[12%] h-[420px] w-[420px] md:h-[500px] md:w-[500px] rounded-full`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(6,214,160,0.14) 0%, rgba(6,214,160,0.08) 42%, transparent 75%)",
          filter: "blur(120px)",
          animationDelay: "-7s, -3s",
        }}
      />
      <div
        className={`ambient-glow-blob ambient-glow-drift-c ${pulseClass} absolute left-[28%] bottom-[-18%] h-[520px] w-[520px] md:h-[620px] md:w-[620px] rounded-full`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(6,214,160,0.2) 0%, rgba(6,214,160,0.08) 40%, transparent 78%)",
          filter: "blur(140px)",
          animationDelay: "-14s, -5s",
        }}
      />
    </div>
  );
}
