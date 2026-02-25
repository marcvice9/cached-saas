"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const HEADER_HEIGHT = 88;
const ACTIVE_SECTION_OFFSET = 120; // Matches landing anchor offset (scroll-mt-28 ~= 112px)

const NAV_ITEMS = [
  { href: "#features", label: "Features", id: "features" },
  { href: "#how-it-works", label: "How it Works", id: "how-it-works" },
  { href: "#vault", label: "The Vault", id: "vault" },
  { href: "#pricing", label: "Pricing", id: "pricing" },
] as const;

export default function NavbarV2() {
  const sectionIds = useMemo(() => NAV_ITEMS.map((item) => item.id), []);
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const resolveActiveSection = () => {
      const viewportBottom = window.scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight;

      if (viewportBottom >= pageBottom - 2) {
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current: string = sectionIds[0];
      for (const section of sections) {
        if (window.scrollY + ACTIVE_SECTION_OFFSET >= section.offsetTop) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    const observer = new IntersectionObserver(
      () => {
        resolveActiveSection();
      },
      {
        rootMargin: `-${ACTIVE_SECTION_OFFSET}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    resolveActiveSection();

    window.addEventListener("scroll", resolveActiveSection, { passive: true });
    window.addEventListener("hashchange", resolveActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", resolveActiveSection);
      window.removeEventListener("hashchange", resolveActiveSection);
    };
  }, [sectionIds]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#09090B]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] w-full max-w-[1440px] items-center justify-between px-6 md:px-[52px]">
        <Link href="/" className="flex items-center gap-3" aria-label="Cached home">
          <Image
            src="/logo_v3.jpg"
            alt="Cached logo"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-md object-cover"
          />
          <span className="text-xl font-semibold leading-none tracking-[-0.02em] [font-family:'Switzer',sans-serif] text-[#FAFAFA]">
            Cached
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={`border-b pb-1 text-sm transition-colors ${
                  isActive
                    ? "border-[#06D6A0] text-[#06D6A0]"
                    : "border-transparent text-[#A1A1AA] hover:text-[#FAFAFA]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <a href="/auth/login?next=/app" className="text-sm text-[#D4D4D8] hover:text-[#FAFAFA]">
            Login
          </a>
          <Link
            href="/get-started"
            className="rounded-full border border-transparent bg-[#06D6A0] px-5 py-2 text-sm font-medium text-[#09090B] transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
