import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CERTIFICATE_INCLUDE, formatTrainingDate, type CertificateWithTraining } from "@/lib/certificates";
import { DEFAULT_LOCALE, getDictionary, isLocale } from "@/lib/i18n";

// A certificate can be corrected or revoked from the dashboard at any time
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: getDictionary(lang).certificate.verifyBadge,
    robots: { index: false, follow: false },
  };
}

export default async function VerifyPage({ params }: Props) {
  const { lang: rawLang, code: rawCode } = await params;
  const lang = isLocale(rawLang) ? rawLang : DEFAULT_LOCALE;
  const dict = getDictionary(lang);
  const t = dict.certificate;

  // Codes are printed in capitals; accept them typed with dashes or lowercase
  const code = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const cert: CertificateWithTraining | null = /^[A-Z0-9]{8}$/.test(code)
    ? await prisma.certificates.findUnique({ where: { code }, include: CERTIFICATE_INCLUDE })
    : null;

  return (
    <section className="min-h-[75vh] bg-[#f8fafc] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10 px-4 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold tracking-wide text-[#9c7d42]">{t.verifyBadge}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className={`flex items-center gap-4 px-6 py-5 ${cert ? "bg-emerald-50" : "bg-red-50"}`}>
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                cert ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d={cert ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                />
              </svg>
            </span>
            <div>
              <h1 className={`text-xl font-extrabold ${cert ? "text-emerald-800" : "text-red-800"}`}>
                {cert ? t.validTitle : t.invalidTitle}
              </h1>
              <p className={`text-sm ${cert ? "text-emerald-700" : "text-red-700"}`}>{cert ? t.validText : t.invalidText}</p>
            </div>
          </div>

          {cert && (
            <dl className="divide-y divide-slate-100 px-6">
              {[
                [t.participantLabel, <span key="n" className="font-serif text-lg font-semibold uppercase tracking-wide">{cert.participant_name}</span>],
                [t.trainingLabel, cert.training.title],
                [t.dateLabel, formatTrainingDate(cert.training.starts_on, cert.training.ends_on, dict.dateLocale)],
                [t.numberLabel, cert.number],
              ].map(([label, value], i) => (
                <div key={i} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr]">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
                  <dd className="text-sm font-semibold text-[#0f1932]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
