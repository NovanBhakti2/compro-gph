// app/news/page.tsx
import CtaSection from "@/components/organisms/CtaSection";
import CuratedArticlesSection from "@/components/organisms/CuratedArticlesSection";
import NewsArticlesSection from "@/components/organisms/NewsArticlesSection";
import { NewsItem } from "@/data/news";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getNewsData(): Promise<NewsItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil data dari API");
    }

    const responseData = await res.json();
    return responseData.data || [];
  } catch (error) {
    console.error("Error fetching news in NewsPage:", error);
    return [];
  }
}

export default async function NewsPage() {
  const newsList = await getNewsData();
  console.log("NewsPage - newsList:", newsList);

  return (
    <main>
      <NewsArticlesSection initialNews={newsList} />
      <CuratedArticlesSection initialNews={newsList} />
      <CtaSection />
    </main>
  );
}