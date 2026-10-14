// app/[lang]/news/[slug]/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseKeyTopics } from "@/lib/keyTopics";
import { KeyTopicsBox } from "@/components/molecules/KeyTopicsBox";
import { parseGallery } from "@/lib/gallery";
import { GallerySection } from "@/components/molecules/GallerySection";
import { formatArticleDate } from "@/lib/articleDate";
import { articleDescription, getPublishedArticle, localizeArticle, type NewsWithCategory } from "@/lib/news";
import { shareImageUrl } from "@/lib/site";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  languageAlternates,
  localizePath,
  type Locale,
} from "@/lib/i18n";

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

async function getArticle(params: PageProps["params"]) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const article = await getPublishedArticle(slug);
  return { locale, article: article && localizeArticle(article, locale) };
}

// Share preview (WhatsApp, LinkedIn, ...) and search result for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, article } = await getArticle(params);
  if (!article) return { title: getDictionary(locale).notFound.title };

  const description = articleDescription(article);
  const path = `/news/${article.slug}`;
  const url = localizePath(locale, path);
  // Without a thumbnail, the site-wide opengraph-image is used
  const images = article.thumbnail_url
    ? [{ url: shareImageUrl(article.thumbnail_url), width: 1200, alt: article.title }]
    : undefined;

  return {
    title: article.title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description,
      locale: getDictionary(locale).meta.ogLocale,
      publishedTime: (article.published_at ?? article.created_at).toISOString(),
      modifiedTime: article.updated_at.toISOString(),
      section: article.categories?.name,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(images && { images }),
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale, article } = await getArticle(params);

  if (!article) {
    notFound();
  }

  const dict = getDictionary(locale);
  const t = dict.news;
  const keyTopics = parseKeyTopics(article.key_topics);
  const gallery = parseGallery(article.gallery);

  const related: NewsWithCategory[] = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: article.id },
    },
    take: 3,
    include: { categories: true },
  });
  const relatedArticles = related.map((rel) => localizeArticle(rel, locale));

  return (
    <article className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-20 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <div>
            <Link
              href={localizePath(locale, "/news")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#C7974C] transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>{t.back}</span>
            </Link>
          </div>
        </nav>

        {!article.translated && (
          <p className="rounded-xl border border-[#C7974C]/30 bg-[#C7974C]/10 px-4 py-2.5 text-xs font-medium text-[#8a6a32]">
            {t.notTranslated}
          </p>
        )}

        <header className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                {article.categories?.name || t.defaultCategory}
              </span>
            </div>
            <time
              dateTime={(article.published_at ?? article.created_at).toISOString()}
              className="text-xs font-semibold text-slate-400"
            >
              {formatArticleDate(article.published_at ?? article.created_at, dict.dateLocale)}
            </time>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f1932] tracking-tight leading-[1.15]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}
        </header>

        {article.thumbnail_url && (
          <figure className="space-y-3">
            <div className="w-full h-[360px] sm:h-[520px] rounded-3xl overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
              <img
                src={article.thumbnail_url}
                alt={article.thumbnail_caption || article.title}
                className="w-full h-full object-cover"
              />
            </div>
            {article.thumbnail_caption && (
              <figcaption className="flex items-start gap-2 px-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                <span className="mt-[0.45em] h-px w-5 shrink-0 bg-[#C7974C]" aria-hidden />
                {article.thumbnail_caption}
              </figcaption>
            )}
          </figure>
        )}

        <div
          className={
            keyTopics.length
              ? "pt-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
              : "pt-4"
          }
        >
          <div
            className={`article-content ${keyTopics.length ? "lg:col-span-7" : ""}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          {keyTopics.length > 0 && (
            <aside className="lg:col-span-5 lg:sticky lg:top-28">
              <KeyTopicsBox title={article.key_topics_title} topics={keyTopics} label={t.keyTopics} />
            </aside>
          )}
        </div>

        {gallery.length > 0 && (
          <GallerySection
            label={article.gallery_label}
            title={article.gallery_title}
            images={gallery}
          />
        )}

        {relatedArticles.length > 0 && (
          <section className="pt-16 border-t border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {t.relatedLabel}
              </span>
              <h2 className="text-2xl font-extrabold text-[#0f1932]">
                {t.relatedTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={localizePath(locale, `/news/${rel.slug}`)}
                  className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={
                          rel.thumbnail_url || "https://placehold.co/600x400"
                        }
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#9c7d42] uppercase tracking-wider">
                      {rel.categories?.name || t.relatedCategory}
                    </span>
                    <h3 className="text-sm font-bold text-[#0f1932] group-hover:text-[#9c7d42] transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-[#0f1932] transition-colors">
                    <span>{t.readArticle}</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
