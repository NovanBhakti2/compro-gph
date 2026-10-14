import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { parseKeyTopics } from "@/lib/keyTopics";
import type { Locale } from "@/lib/i18n/config";
import type { categories, news } from "@prisma/client";

/** A news row with its category (lib/prisma's client is untyped). */
export type NewsWithCategory = news & {
  categories: Pick<categories, "id" | "name" | "slug"> | null;
};

type TranslatableArticle = {
  title: string;
  excerpt: string | null;
  content: string;
  key_topics_title: string | null;
  key_topics: unknown;
  gallery_label: string | null;
  gallery_title: string | null;
  thumbnail_caption: string | null;
  title_id: string | null;
  excerpt_id: string | null;
  content_id: string | null;
  key_topics_title_id: string | null;
  key_topics_id: unknown;
  gallery_label_id: string | null;
  gallery_title_id: string | null;
  thumbnail_caption_id: string | null;
};

/**
 * The article in one language. Indonesian fields fall back to English when
 * empty; `translated` says whether the Indonesian body exists. The *_id
 * columns are dropped so the other language isn't sent to the browser.
 */
export function localizeArticle<T extends TranslatableArticle>(article: T, locale: Locale) {
  const {
    title_id,
    excerpt_id,
    content_id,
    key_topics_title_id,
    key_topics_id,
    gallery_label_id,
    gallery_title_id,
    thumbnail_caption_id,
    ...base
  } = article;

  if (locale !== "id") return { ...base, translated: true };

  return {
    ...base,
    title: title_id || base.title,
    excerpt: excerpt_id || base.excerpt,
    content: content_id || base.content,
    key_topics_title: key_topics_title_id || base.key_topics_title,
    key_topics: parseKeyTopics(key_topics_id).length ? key_topics_id : base.key_topics,
    gallery_label: gallery_label_id || base.gallery_label,
    gallery_title: gallery_title_id || base.gallery_title,
    thumbnail_caption: thumbnail_caption_id || base.thumbnail_caption,
    translated: Boolean(content_id?.trim()),
  };
}

/** Published articles, newest first: used by the /news page and /api/news. */
export function getPublishedNews() {
  return prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { published_at: "desc" },
    include: {
      users: {
        select: { id: true, name: true, email: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

/**
 * One published article by slug, or null. Cached per request so
 * generateMetadata and the page share a single query.
 */
export const getPublishedArticle = cache(async (slug: string) => {
  const article = await prisma.news.findUnique({
    where: { slug },
    include: {
      categories: true,
      users: { select: { name: true } },
    },
  });
  return article?.status === "PUBLISHED" ? article : null;
});

/** Plain-text summary for meta descriptions: excerpt, else the article text. */
export function articleDescription(
  article: { excerpt: string | null; content: string },
  maxLength = 160
) {
  const text = (
    article.excerpt ||
    article.content
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
  )
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, text.lastIndexOf(" ", maxLength - 1)).replace(/[,.;:]$/, "") + "…";
}
