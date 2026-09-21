import CtaSection from "@/components/organisms/CtaSection";
import CuratedArticlesSection from "@/components/organisms/CuratedArticlesSection";
import NewsArticlesSection from "@/components/organisms/NewsArticlesSection";

export default function NewsPage() {
  return (
    <main>
      <NewsArticlesSection />
      <CuratedArticlesSection />
      <CtaSection />
    </main>
  );
}