import HeroHeadline from "./hero/HeroHeadline";
import HeroCopy from "./hero/HeroCopy";
import BeforeAfterVisual from "./hero-v2/BeforeAfterVisual";
import AmbientGlowLayer from "@/components/ui/AmbientGlowLayer";

// Landing v2 hero: same left narrative, new right-side before/after animation.
export default function HeroV2() {
  return (
    <section className="relative bg-[#09090B] overflow-hidden">
      <AmbientGlowLayer intensity="medium" />
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-[52px] py-12 lg:grid-cols-[520px_1fr] lg:items-center" style={{ minHeight: 780 }}>
        <div className="relative z-[2] flex flex-col gap-6">
          <HeroHeadline />
          <HeroCopy />
        </div>

        <div className="relative z-[1]">
          <BeforeAfterVisual />
        </div>

        {/* Ambient gradient glow behind the card */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-35" aria-hidden>
          <div className="absolute right-[-180px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(6,214,160,0.12),_transparent_60%)] blur-3xl" />
          <div className="absolute left-[-200px] bottom-[-120px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(6,214,160,0.08),_transparent_60%)] blur-3xl" />
        </div>
      </div>
    </section>
  );
}
