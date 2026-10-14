// app/[lang]/news/page.tsx
import type { Metadata } from "next";
import CtaSection from "@/components/organisms/CtaSection";
import CuratedArticlesSection from "@/components/organisms/CuratedArticlesSection";
import NewsArticlesSection from "@/components/organisms/NewsArticlesSection";
import { NewsItem } from "@/data/news";
import { getPublishedNews, localizeArticle, type NewsWithCategory } from "@/lib/news";
import { DEFAULT_LOCALE, getDictionary, isLocale, languageAlternates, localizePath } from "@/lib/i18n";

// Dashboard actions revalidate this page on every save, so edits show up right
// away; this is only the fallback refresh interval.
export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const path = localizePath(isLocale(lang) ? lang : DEFAULT_LOCALE, "/news");
  return {
    title: dict.meta.newsTitle,
    description: dict.meta.newsDescription,
    alternates: { canonical: path, languages: languageAlternates("/news") },
    openGraph: { url: path, title: `${dict.meta.newsTitle} | Gama Putra Harmoni` },
  };
}

async function getNewsData(lang: string): Promise<NewsItem[]> {
  // Query the database directly instead of fetching our own /api/news over
  // HTTP, which fails during the build when the site isn't deployed yet.
  try {
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    return (await getPublishedNews()).map((article: NewsWithCategory) => localizeArticle(article, locale));
  } catch (error) {
    console.error("Error fetching news in NewsPage:", error);
    return [];
  }
}

export default async function NewsPage({ params }: Props) {
  const { lang: rawLang } = await params;
  const lang = isLocale(rawLang) ? rawLang : DEFAULT_LOCALE;
  const dict = getDictionary(lang);
  const newsList = await getNewsData(lang);

  return (
    <main>
      <NewsArticlesSection initialNews={newsList} lang={lang} dict={dict.news} dateLocale={dict.dateLocale} />
      <CuratedArticlesSection initialNews={newsList} lang={lang} dict={dict.news} dateLocale={dict.dateLocale} />
      <CtaSection lang={lang} dict={dict.cta} />
    </main>
  );
}
