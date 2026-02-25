"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navTabs = [
  { href: "/app", label: "Home", exact: true },
  { href: "/app/library", label: "Library" },
  { href: "/app/schedule", label: "Schedule" },
  { href: "/app/vault", label: "Vault" },
];

const dropdownItems = [{ href: "/app/billing", label: "Billing" }];

export default function AppNavbar({
  userName,
  userEmail,
  avatarUrl,
}: {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const initials = (userName || userEmail || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 mx-4 mt-3 rounded-2xl border border-white/10 bg-[#23272B]/85 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Cached home">
          <Image
            src="/logo_v3.jpg"
            alt="Cached logo"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-md object-cover"
          />
          <span className="text-lg font-semibold leading-none tracking-[-0.02em] [font-family:'Switzer',sans-serif] text-[#FAFAFA]">
            Cached
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navTabs.map((tab) => {
            const active = isActive(tab.href, tab.exact);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex min-w-[108px] items-center justify-center rounded-xl px-4 py-2 text-base font-semibold transition ${
                  active
                    ? "text-[#0E2E29]"
                    : "bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-xl bg-[#06D6A0]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative text-center leading-none">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/10"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1A1C1E]">
                {initials}
              </div>
            )}
            <span className="hidden sm:inline">{userName || userEmail || "Account"}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#24272B] py-1"
              >
                {dropdownItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-white/10" />
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/20"
                  >
                    Log out
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
