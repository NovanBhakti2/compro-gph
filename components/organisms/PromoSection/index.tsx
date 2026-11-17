"use client";

import { useState } from "react";
import { FadeIn } from "@/components/atoms/animations/FadeIn";
import { PromoDialog } from "@/components/molecules/PromoDialog";
import { promoCtaHref, type PublicPromo } from "@/lib/promo-shared";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  /** Live flyers only (filtered on the server) */
  promos: PublicPromo[];
  lang: Locale;
  dict: Dictionary["promo"];
  dateLocale: string;
};

/**
 * "Programs & Training" on the news page: every live flyer as a card, opening
 * the same dialog as the popup. Unlike the popup it stays available, so
 * visitors who closed the popup can find the flyer again.
 */
export default function PromoSection({ promos, lang, dict, dateLocale }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (promos.length === 0) return null;

  const isId = lang === "id";
  const image = (p: PublicPromo) => (isId && p.imageUrlId) || p.imageUrl;
  const ctaLabel = (p: PublicPromo) => (isId && p.ctaLabelId) || p.ctaLabel;
  const ctaUrl = (p: PublicPromo) => promoCtaHref(p.ctaUrl, lang);
  const until = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    <section id="programs" className="overflow-hidden bg-[#0f1932] px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-10">
        <FadeIn direction="up" delay={0.1}>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10 px-4 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7974C]" />
              <span className="text-xs font-semibold tracking-wide text-[#d8bd8d]">{dict.sectionBadge}</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{dict.sectionTitle}</h2>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">{dict.sectionSubtitle}</p>
          </div>
        </FadeIn>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p, i) => {
            const label = ctaLabel(p);
            const href = ctaUrl(p);
            const external = Boolean(href && /^https?:\/\//.test(href));
            return (
              <FadeIn key={p.id} direction="up" delay={0.15 + i * 0.08} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className="group relative block overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:ring-[#C7974C]/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C7974C]/50"
                >
                  <img
                    src={image(p)}
                    alt={dict.flyerAlt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-[#0b1329]/90 to-transparent pb-4 pt-12 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14zM11 8v6M8 11h6" />
                    </svg>
                    {dict.viewFlyer}
                  </span>
                </button>

                {(p.endsAt || (label && href)) && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {p.endsAt ? (
                      <span className="text-xs text-slate-400">
                        {dict.until} {until.format(new Date(p.endsAt))}
                      </span>
                    ) : (
                      <span />
                    )}
                    {label && href && (
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-2 rounded-full bg-[#C7974C] px-5 py-2.5 text-xs font-bold text-[#0f1932] transition hover:-translate-y-0.5 hover:bg-[#d8bd8d]"
                      >
                        {label}
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </FadeIn>
            );
          })}
        </div>
      </div>

      {openIndex !== null && (
        <PromoDialog
          slides={promos.map((p) => ({ imageUrl: image(p), ctaLabel: ctaLabel(p), ctaUrl: ctaUrl(p) }))}
          startIndex={openIndex}
          imageAlt={dict.flyerAlt}
          closeLabel={dict.close}
          prevLabel={dict.previous}
          nextLabel={dict.next}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
