import HeroHeadline from "./hero/HeroHeadline";
import HeroCopy from "./hero/HeroCopy";
import HeroPhoneComposite from "./hero/HeroPhoneComposite";
import HeroBackground from "./hero/HeroBackground";
import HeroNetBackground from "./hero/HeroNetBackground";

/**
 * Hero section — server component shell.
 * Composes 4 client sub-components for animations.
 */
export default function Hero() {
  return (
    <section
      className="w-full bg-[#F7F6F4] overflow-hidden"
      style={{ height: "886px", position: "relative" }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: "1440px",
          padding: "0 52px",
          position: "relative",
          height: "100%",
        }}
      >
        {/* ── NET / MESH BACKGROUND ── */}
        <HeroNetBackground />

        {/* ── TEXT: left column ── */}
        <div
          className="flex flex-col justify-center"
          style={{
            position: "absolute",
            top: 0,
            left: 52,
            bottom: 0,
            width: 560,
          }}
        >
          <HeroHeadline />
          <HeroCopy />
        </div>

        {/* ── ORANGE CIRCLE (animated gradient) ── */}
        <HeroBackground />

        {/* ── PHONE COMPOSITE (hand + screen + frame, float + parallax) ── */}
        <HeroPhoneComposite />
      </div>
    </section>
  );
}
