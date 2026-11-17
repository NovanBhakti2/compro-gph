import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTrainingDate, formatTrainingTime, type Training } from "@/lib/certificates";
import { openRegistrationWhere } from "@/lib/registrations";
import { DEFAULT_LOCALE, getDictionary, isLocale, localizePath } from "@/lib/i18n";
import { RegisterForm } from "@/components/organisms/RegisterForm";

// The list follows the dashboard switches and the training dates
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ training?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(lang).registration;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { lang: rawLang } = await params;
  const lang = isLocale(rawLang) ? rawLang : DEFAULT_LOCALE;
  const dict = getDictionary(lang);
  const t = dict.registration;

  const trainings: Training[] = await prisma.trainings.findMany({
    where: openRegistrationWhere(),
    orderBy: { starts_on: "asc" },
  });
  const requested = (await searchParams).training;
  const slug = typeof requested === "string" ? requested : undefined;
  // A link to a training that is no longer open still lands on the list
  const preselected = trainings.some((tr) => tr.slug === slug) ? slug : undefined;

  return (
    <section className="min-h-[75vh] bg-[#f8fafc] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10 px-4 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold tracking-wide text-[#9c7d42]">{t.badge}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0f1932] sm:text-4xl">
            {trainings.length ? t.title : t.emptyTitle}
          </h1>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          {trainings.length ? (
            <RegisterForm
              lang={lang}
              dict={t}
              notice={slug && !preselected ? t.unavailable : undefined}
              initialTraining={preselected ?? (trainings.length === 1 ? trainings[0].slug : "")}
              trainings={trainings.map((tr) => ({
                slug: tr.slug,
                title: tr.title,
                date: [formatTrainingDate(tr.starts_on, tr.ends_on, dict.dateLocale), formatTrainingTime(tr)]
                  .filter(Boolean)
                  .join(" · "),
                location: tr.location,
              }))}
            />
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm leading-relaxed text-slate-500">{t.emptyText}</p>
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
    </section>
  );
}
