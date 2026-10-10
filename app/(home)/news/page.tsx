// app/news/page.tsx
import CtaSection from "@/components/organisms/CtaSection";
import CuratedArticlesSection from "@/components/organisms/CuratedArticlesSection";
import NewsArticlesSection from "@/components/organisms/NewsArticlesSection";
import { NewsItem } from "@/data/news";
import { getPublishedNews } from "@/lib/news";

// Dashboard actions call revalidatePath("/news"), so edits show up right away;
// this is only the fallback refresh interval.
export const revalidate = 300;

async function getNewsData(): Promise<NewsItem[]> {
  // Query the database directly instead of fetching our own /api/news over
  // HTTP, which fails during the build when the site isn't deployed yet.
  try {
    return await getPublishedNews();
  } catch (error) {
    console.error("Error fetching news in NewsPage:", error);
    return [];
  }
}

export default async function NewsPage() {
  const newsList = await getNewsData();

  return (
    <main>
      <NewsArticlesSection initialNews={newsList} />
      <CuratedArticlesSection initialNews={newsList} />
      <CtaSection />
    </main>
  );
}
