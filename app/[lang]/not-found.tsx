import Link from "next/link";
import { lang } from "next/root-params";
import { getDictionary, isLocale, localizePath } from "@/lib/i18n";

// 404 inside the public layout (navbar + footer), e.g. an unknown article slug
export default async function NotFound() {
  const raw = (await lang()) ?? "en";
  const locale = isLocale(raw) ? raw : "en";
  const t = getDictionary(locale).notFound;

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc] px-6 py-24">
      <div className="max-w-lg space-y-5 text-center">
        <p className="text-7xl font-extrabold tracking-tight text-[#C7974C]">404</p>
        <h1 className="text-2xl font-extrabold text-[#0f1932] sm:text-3xl">{t.title}</h1>
        <p className="text-sm text-slate-500 sm:text-base">{t.text}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={localizePath(locale, "/")}
            className="rounded-xl bg-[#0f1932] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1b2a4d]"
          >
            {t.home}
          </Link>
          <Link
            href={localizePath(locale, "/news")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.news}
          </Link>
        </div>
      </div>
    </section>
  );
}
