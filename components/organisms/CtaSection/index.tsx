"use client";

import React from "react";
import Link from "next/link";
import { FadeIn } from "@/components/atoms/animations/FadeIn";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localizePath, type Locale } from "@/lib/i18n/config";

export default function CtaSection({ lang, dict }: { lang: Locale; dict: Dictionary["cta"] }) {
  return (
    <section className="py-24 px-6 lg:px-20 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <FadeIn direction="up" delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
              {dict.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0f1932] tracking-tight mt-3">
            {dict.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mt-4">
            {dict.text}
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={localizePath(lang, "/#contact")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#C7974C] text-white text-xs font-semibold tracking-wide hover:bg-[#b0833e] transition-all shadow-md hover:shadow-lg"
            >
              {dict.consult}
            </Link>
            <Link
              href={localizePath(lang, "/#services")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold tracking-wide hover:bg-slate-50 transition-colors"
            >
              {dict.explore}
            </Link>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-100 max-w-3xl mx-auto sm:ml-[100px]">
            <div className="flex items-center justify-center gap-3 text-left mr-4">
              <div className="w-8 h-8 rounded-full bg-[#C7974C]/10 flex items-center justify-center text-[#C7974C]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0f1932]">{dict.stats[0].title}</p>
                <p className="text-[11px] text-slate-400">
                  {dict.stats[0].sub}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#C7974C]/10 flex items-center justify-center text-[#C7974C]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0f1932]">
                  {dict.stats[1].title}
                </p>
                <p className="text-[11px] text-slate-400">
                  {dict.stats[1].sub}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#C7974C]/10 flex items-center justify-center text-[#C7974C]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0f1932]">
                  {dict.stats[2].title}
                </p>
                <p className="text-[11px] text-slate-400">
                  {dict.stats[2].sub}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
