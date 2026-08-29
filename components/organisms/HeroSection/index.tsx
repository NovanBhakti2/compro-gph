import React from "react";
import Link from "next/link";
import { FadeIn } from "@/components/atoms/animations/FadeIn";

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] w-full flex items-center bg-[#0f1932] overflow-hidden px-6 lg:px-20 scroll-mt-24"
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0b1329] via-[#0f1932]/90 to-transparent" />

      <div className="relative z-10 max-w-4xl py-20 space-y-6">
        <FadeIn delay={0.2} direction="down">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5aa7a]/40 bg-[#c5aa7a]/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
            <span className="text-xs font-medium text-[#c5aa7a] tracking-wide">
              Professional Consulting & Training
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} direction="left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
            Experience the Best of Hospitality, Elevated by Our Commitment to
            Safety & Standards
          </h1>
        </FadeIn>

        <FadeIn delay={0.6} direction="up">
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
            Professional consulting and training company helping organizations
            improve performance, compliance, and operational excellence.
          </p>
        </FadeIn>

        <FadeIn delay={0.8} direction="right">
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#0f1932] bg-[#c5aa7a] hover:bg-[#d8bd8d] transition-all shadow-lg shadow-[#c5aa7a]/20"
            >
              Explore Our Services
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
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-white border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-sm active:scale-95 transition-transform duration-200"
            >
              Contact Our Team
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
