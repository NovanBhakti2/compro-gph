import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";
import { LOCALES, languageAlternates, localizePath } from "@/lib/i18n/config";

// Rebuilt at most hourly; dashboard actions also revalidate it on publish
export const revalidate = 3600;

const absolute = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

/** One entry per language, each listing all language versions (hreflang). */
function entries(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([lang, url]) => [lang, absolute(url)])
  );
  return LOCALES.map((locale) => ({
    url: absolute(localizePath(locale, path)),
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    ...entries("/", { changeFrequency: "monthly", priority: 1 }),
    ...entries("/news", { changeFrequency: "weekly", priority: 0.8 }),
  ];

  try {
    const articles = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { published_at: "desc" },
      select: { slug: true, updated_at: true },
    });
    return [
      ...pages,
      ...articles.flatMap((a: { slug: string; updated_at: Date }) =>
        entries(`/news/${a.slug}`, {
          lastModified: a.updated_at,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      ),
    ];
  } catch (error) {
    // Keep serving the static pages if the database is unreachable
    console.error("sitemap:", error);
    return pages;
  }
}
