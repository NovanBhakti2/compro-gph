import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

// Same offsets as FadeIn's directions, driven by the CSS `.hero-in` animation
// (app/globals.css) so the hero animates on first paint instead of after JS.
const heroIn = (x: number, y: number, delay: number) =>
  ({
    "--hero-x": `${x}px`,
    "--hero-y": `${y}px`,
    animationDelay: `${delay}s`,
  }) as React.CSSProperties;

export const HeroSection = ({ dict }: { dict: Dictionary["hero"] }) => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] w-full flex items-center bg-[#0f1932] overflow-hidden px-6 lg:px-20 scroll-mt-24"
    >
      {/* next/image serves a size that fits the screen instead of a 2070px photo */}
      <Image
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={60}
        className="z-0 object-cover opacity-25 mix-blend-luminosity"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0b1329] via-[#0f1932]/90 to-transparent" />

      <div className="relative z-10 max-w-4xl py-20 space-y-6">
        <div className="hero-in" style={heroIn(0, -30, 0.05)}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C7974C]/40 bg-[#C7974C]/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-medium text-[#C7974C] tracking-wide">
              {dict.badge}
            </span>
          </div>
        </div>

        <div className="hero-in" style={heroIn(30, 0, 0.12)}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
            {dict.title}
          </h1>
        </div>

        <div className="hero-in" style={heroIn(0, 30, 0.2)}>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        <div className="hero-in" style={heroIn(-30, 0, 0.28)}>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#0f1932] bg-[#C7974C] hover:bg-[#d8bd8d] transition-all shadow-lg shadow-[#C7974C]/20"
            >
              {dict.ctaServices}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>

            <Link
              href="#team"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-white border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-sm active:scale-95 transition-transform duration-200"
            >
              {dict.ctaTeam}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
