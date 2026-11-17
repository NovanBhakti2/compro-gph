import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { claimStatus, formatClaimUntil, formatTrainingDate, type Training } from "@/lib/certificates";
import { DEFAULT_LOCALE, getDictionary, isLocale, localizePath } from "@/lib/i18n";
import { ClaimForm } from "@/components/organisms/ClaimForm";

// Opens/closes with the claim period and the dashboard switch
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: getDictionary(lang).certificate.claimTitle,
    robots: { index: false, follow: false },
  };
}

export default async function ClaimPage({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const lang = isLocale(rawLang) ? rawLang : DEFAULT_LOCALE;
  const dict = getDictionary(lang);
  const t = dict.certificate;

  const training: Training | null = await prisma.trainings.findUnique({ where: { slug } });
  if (!training) notFound();
  const open = claimStatus(training) === "OPEN";
  const date = formatTrainingDate(training.starts_on, training.ends_on, dict.dateLocale);

  return (
    <section className="min-h-[75vh] bg-[#f8fafc] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10 px-4 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold tracking-wide text-[#9c7d42]">{t.claimBadge}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0f1932] sm:text-4xl">
            {open ? t.claimTitle : t.closedTitle}
          </h1>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <dl className="grid gap-4 border-b border-slate-100 bg-[#0f1932] px-6 py-5 text-white sm:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#d8bd8d]">{t.trainingLabel}</dt>
              <dd className="mt-1 text-lg font-bold leading-snug">{training.title}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#d8bd8d]">{t.dateLabel}</dt>
              <dd className="mt-1 text-sm font-semibold sm:text-right">{date}</dd>
            </div>
          </dl>

          {open && training.claim_until && (
            <p className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-6 py-2.5 text-xs text-amber-800">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {t.claimUntil} <b>{formatClaimUntil(training.claim_until, dict.dateLocale)}</b>
              </span>
            </p>
          )}
          <div className="p-6">
            {open ? (
              <ClaimForm slug={slug} dict={t} />
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-relaxed text-slate-500">{t.closedText}</p>
                <Link
                  href={localizePath(lang, "/#contact")}
                  className="inline-flex rounded-xl bg-[#0f1932] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1b2a4d]"
                >
                  {t.contactUs}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
