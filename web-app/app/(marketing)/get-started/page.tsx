export const metadata = {
  title: "Get Started | Cached",
};

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-[#09090B] px-6 py-20 text-[#FAFAFA] md:px-[52px]">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-[#111114] p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#06D6A0]">Get Started</p>
        <h1 className="mt-4 text-3xl font-semibold md:text-5xl">
          Turn saved content into scheduled learning.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#D4D4D8]">
          Cached helps you centralize links, map goals, and execute consistently. Continue with
          GitHub to set up your workspace.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="/auth/login?next=/app"
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#06D6A0] px-7 py-3 text-sm font-medium text-[#09090B] transition-opacity hover:opacity-90"
          >
            Continue with GitHub
          </a>
          <a
            href="/auth/login?next=/app"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-[#FAFAFA] transition-colors hover:border-white/35"
          >
            I already have an account
          </a>
        </div>
      </div>
    </main>
  );
}
