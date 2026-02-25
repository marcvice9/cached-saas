import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-[#09090B]">
      <div className="max-w-[1440px] mx-auto px-[52px] h-[92px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Cached home">
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

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-[16px] font-normal text-[#A1A1AA] hover:opacity-70 transition-opacity"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-[16px] font-normal text-[#A1A1AA] hover:opacity-70 transition-opacity"
          >
            Pricing
          </Link>
        </nav>

        {/* CTA Button */}
        <a
          href="/auth/login"
          className="hidden md:flex items-center justify-center px-6 py-[10px] bg-[#06D6A0] text-[#09090B] text-[16px] font-medium rounded-[32px] border border-transparent hover:opacity-90 transition-opacity"
        >
          Get Started
        </a>
      </div>
    </header>
  );
}
