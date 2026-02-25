import HeroV2 from "@/components/sections/HeroV2";
import NavbarV2 from "@/components/layout/NavbarV2";
import AmbientGlowLayer from "@/components/ui/AmbientGlowLayer";

const PROBLEM_CARDS = [
  {
    title: "Fragmented",
    description: "Content is scattered across 10+ apps.",
  },
  {
    title: "Unstructured",
    description: "No distinction between a 2-minute tweet and a 2-hour course.",
  },
  {
    title: "Static",
    description: "Saving is easy; finding the time to act is the missing link.",
  },
];

const STEPS = [
  {
    title: "Centralize",
    copy: "Forward any link (YouTube, X, Newsletters) to one inbox.",
  },
  {
    title: "Define Intent",
    copy: "Attach content to goals like 'System Design' or 'Photography'.",
  },
  {
    title: "Map Learning Windows",
    copy: "Set your availability (e.g., Tues/Thurs 10 AM). Cached only schedules when you're ready.",
  },
  {
    title: "Intelligent Scheduling",
    copy: "Cached matches content length to your windows. No 45-min podcasts in 20-min gaps.",
  },
];

const PERSONAS = [
  {
    title: "The Builder",
    copy: "You collect tutorials and docs to ship faster. Cached turns your backlog into execution windows.",
  },
  {
    title: "The Career Switcher",
    copy: "You are learning under pressure. Cached helps you stay consistent by aligning content with real time blocks.",
  },
  {
    title: "The Lifelong Learner",
    copy: "You are curious by default. Cached keeps your insights structured so every session compounds.",
  },
];

function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-[8%] top-16 animate-[float_7s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-white/5 p-3 grayscale">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/50" fill="currentColor">
          <path d="M23.5 6.2a3.2 3.2 0 0 0-2.3-2.3C19.2 3.4 12 3.4 12 3.4s-7.2 0-9.2.5A3.2 3.2 0 0 0 .5 6.2 33.7 33.7 0 0 0 0 12a33.7 33.7 0 0 0 .5 5.8 3.2 3.2 0 0 0 2.3 2.3c2 .5 9.2.5 9.2.5s7.2 0 9.2-.5a3.2 3.2 0 0 0 2.3-2.3A33.7 33.7 0 0 0 24 12a33.7 33.7 0 0 0-.5-5.8ZM9.7 15.6V8.4L16 12l-6.3 3.6Z" />
        </svg>
      </div>
      <div className="absolute right-[10%] top-28 animate-[float_8s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-white/5 p-3 [animation-delay:1s] grayscale">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/50" fill="currentColor">
          <path d="M18.2 2h3.5l-7.6 8.7L23 22h-7l-5.5-7.2L4.2 22H.7l8.2-9.4L.3 2h7.1l5 6.6L18.2 2Zm-1.2 18h1.9L6.8 3.9H4.7L17 20Z" />
        </svg>
      </div>
      <div className="absolute bottom-12 left-[16%] animate-[float_9s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-white/5 p-3 [animation-delay:2s] grayscale">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/50" fill="currentColor">
          <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.7 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.4V9h3.7v11.5Z" />
        </svg>
      </div>
    </div>
  );
}

export default function LandingV2() {
  return (
    <main className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      <NavbarV2 />

      <div className="pt-[88px]">
        <HeroV2 />
      </div>

      <section id="features" className="relative scroll-mt-28 bg-[#111114] px-6 py-24 md:px-[52px]">
        <FloatingIcons />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[#06D6A0]">The Problem</p>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-[#FAFAFA] md:text-5xl">
            Your "Watch Later" list is where great ideas go to die.
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PROBLEM_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-white/10 bg-[#18181B]/90 p-6 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-[#06D6A0]">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#D4D4D8]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative scroll-mt-28 overflow-hidden bg-[#09090B] px-6 py-24 md:px-[52px]">
        <AmbientGlowLayer intensity="low" className="z-0 opacity-65" />
        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[#06D6A0]">How It Works</p>
          <h2 className="text-3xl font-semibold text-[#FAFAFA] md:text-5xl">The 4-Step System</h2>

          <div className="relative mt-12 space-y-8 pl-8 md:pl-12">
            <div className="absolute left-3 top-2 h-[calc(100%-1.2rem)] w-px bg-[#06D6A0]/50 md:left-5" />
            {STEPS.map((step, index) => (
              <article key={step.title} className="relative rounded-2xl border border-white/10 bg-[#111114] p-6">
                <div className="absolute -left-[2.1rem] top-7 h-5 w-5 rounded-full border border-[#06D6A0] bg-[#09090B] md:-left-[2.65rem]" />
                <p className="text-xs uppercase tracking-[0.2em] text-[#06D6A0]">Step {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-[#FAFAFA]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#D4D4D8]">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="vault" className="scroll-mt-28 bg-[#0D0E10] px-6 py-24 md:px-[52px]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[#06D6A0]">The Learning Vault</p>
            <h2 className="text-3xl font-semibold text-[#FAFAFA] md:text-5xl">
              Your learning becomes cumulative, not disposable.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#D4D4D8]">
              After consumption, Cached extracts the signal from the noise. Store AI-summarized
              insights in a searchable, structured personal vault.
            </p>
          </div>

          <article className="rounded-3xl border border-white/10 bg-[#111114] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <p className="text-sm font-medium text-[#FAFAFA]">Knowledge Card</p>
              <span className="rounded-full border border-[#06D6A0]/40 bg-[#06D6A0]/10 px-3 py-1 text-xs text-[#06D6A0]">
                AI Generated
              </span>
            </div>

            <div className="mt-5 space-y-5 text-sm text-[#D4D4D8]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#06D6A0]">Summary</p>
                <p className="mt-2">
                  Event-driven architecture reduces coupling by shifting coordination from direct
                  calls to domain events with explicit ownership.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#06D6A0]">Key Takeaways</p>
                <ul className="mt-2 space-y-2">
                  <li>- Align events to business language, not service names.</li>
                  <li>- Track consumer lag to prevent silent workflow drift.</li>
                  <li>- Pair retries with idempotency keys for safe recovery.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#09090B] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#A1A1AA]">Source</p>
                <a href="#" className="mt-1 inline-block text-[#06D6A0] hover:underline">
                  youtube.com/watch?v=system-design-playbook
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#09090B] px-6 py-24 md:px-[52px]">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-center text-base text-[#D4D4D8]">
            Not a reading app. Not a notes tool. A content execution system.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PERSONAS.map((persona) => (
              <article key={persona.title} className="rounded-2xl border border-white/10 bg-[#111114] p-6">
                <h3 className="text-xl font-semibold text-[#06D6A0]">{persona.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#D4D4D8]">{persona.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 bg-[#09090B] px-6 pb-24 md:px-[52px]">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(6,214,160,0.18),_rgba(9,9,11,0.95)_45%,_rgba(9,9,11,1))] px-6 py-16 md:px-12">
          <AmbientGlowLayer intensity="low" className="z-0 opacity-70" />

          <div className="relative z-10 text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[#06D6A0]">Pricing</p>
            <h2 className="text-3xl font-semibold text-[#FAFAFA] md:text-5xl">
              Choose your learning velocity
            </h2>
          </div>

          <div className="relative z-10 mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#111114]/80 p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-[#A1A1AA]">Free</p>
              <p className="mt-2 text-3xl font-semibold text-[#FAFAFA]">0€</p>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#D4D4D8]">
                <li>- Up to 2 categories</li>
                <li>- Limited AI summaries</li>
                <li>- All the rest of features</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-[#06D6A0]/50 bg-[#111114]/90 p-6 shadow-[0_20px_60px_rgba(6,214,160,0.14)]">
              <p className="text-sm uppercase tracking-[0.18em] text-[#06D6A0]">Pro</p>
              <p className="mt-2 text-3xl font-semibold text-[#FAFAFA]">14.99€/mo</p>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-[#D4D4D8]">
                <li>- Unlimited AI summaries</li>
                <li>- Unlimited categories</li>
                <li>- Send email schedules</li>
              </ul>
            </article>
          </div>

          <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/get-started"
              className="rounded-full border border-transparent bg-[#06D6A0] px-7 py-3 text-sm font-medium text-[#09090B] transition-opacity hover:opacity-90"
            >
              Get Started for Free
            </a>
            <a
              href="#vault"
              className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-[#FAFAFA] transition-colors hover:border-white/35"
            >
              Preview Vault Sample
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
