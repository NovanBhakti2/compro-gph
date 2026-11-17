import Link from "next/link";
import { FadeIn } from "@/components/atoms/animations/FadeIn";
import { formatTrainingDate, formatTrainingTime, type TrainingWithTrainer } from "@/lib/certificates";
import { todayWib } from "@/lib/registrations";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  /** Trainings open for sign-up (filtered on the server) */
  trainings: TrainingWithTrainer[];
  /** More open trainings than shown */
  hasMore: boolean;
  lang: Locale;
  dict: Dictionary["upcomingTrainings"];
  dateLocale: string;
};

/** Homepage schedule. Renders nothing when no training is open for sign-up. */
export function UpcomingTrainingsSection({ trainings, hasMore, lang, dict, dateLocale }: Props) {
  if (trainings.length === 0) return null;
  const today = todayWib();
  const day = new Intl.DateTimeFormat(dateLocale, { day: "numeric", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(dateLocale, { month: "short", timeZone: "UTC" });

  return (
    <section id="trainings" className="scroll-mt-24 bg-[#f8fafc] px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <FadeIn direction="up" delay={0.1}>
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10 px-4 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7974C]" />
              <span className="text-xs font-semibold tracking-wide text-[#9c7d42]">{dict.badge}</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1932] sm:text-4xl">{dict.title}</h2>
            <p className="mx-auto max-w-xl text-sm text-slate-500 sm:text-base">{dict.subtitle}</p>
          </div>
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-6">
          {trainings.map((t, i) => {
            const ongoing = t.starts_on <= today;
            return (
              <FadeIn
                key={t.id}
                direction="up"
                delay={0.15 + i * 0.08}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-[#C7974C]/40">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0f1932] text-white">
                      <span className="text-2xl font-extrabold leading-none">{day.format(t.starts_on)}</span>
                      <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#d8bd8d]">
                        {month.format(t.starts_on)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {ongoing && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {dict.ongoing}
                        </span>
                      )}
                      <h3 className="text-base font-bold leading-snug text-[#0f1932]">{t.title}</h3>
                      <p className="text-xs text-slate-500">{formatTrainingDate(t.starts_on, t.ends_on, dateLocale)}</p>
                      {formatTrainingTime(t) && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <svg className="h-3.5 w-3.5 shrink-0 text-[#C7974C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTrainingTime(t)}
                        </p>
                      )}
                      {t.location && (
                        <p className="flex items-start gap-1.5 text-xs text-slate-500">
                          <svg className="mt-px h-3.5 w-3.5 shrink-0 text-[#C7974C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{t.location}</span>
                        </p>
                      )}
                      {t.trainer && (
                        <p className="text-xs text-slate-500">
                          {dict.trainer}: <span className="font-semibold text-slate-700">{t.trainer.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Pushed down so the buttons line up across cards */}
                  <div className="min-h-6 flex-1" />
                  <Link
                    href={localizePath(lang, `/register?training=${t.slug}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C7974C] px-5 py-3 text-sm font-bold text-[#0f1932] transition hover:bg-[#d8bd8d]"
                  >
                    {dict.register}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </article>
              </FadeIn>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center">
            <Link
              href={localizePath(lang, "/register")}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0f1932]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0f1932] hover:border-[#C7974C]/60"
            >
              {dict.viewAll}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
