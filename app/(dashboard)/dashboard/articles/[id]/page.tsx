import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { updateArticle } from "@/app/actions/articles";
import { ArticleForm } from "@/components/organisms/dashboard/ArticleForm";
import { parseKeyTopics } from "@/lib/keyTopics";
import { parseGallery } from "@/lib/gallery";
import { toDateInputValue } from "@/lib/articleDate";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardUser();
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.news.findUnique({
      where: { id },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        thumbnail_url: true,
        category_id: true,
        status: true,
        published_at: true,
        key_topics_title: true,
        key_topics: true,
        gallery_label: true,
        gallery_title: true,
        gallery: true,
      },
    }),
    prisma.categories.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!article) notFound();

  return (
    <ArticleForm
      heading="Edit artikel"
      action={updateArticle.bind(null, id)}
      categories={categories}
      viewHref={article.status === "PUBLISHED" ? `/news/${article.slug}` : undefined}
      initialValues={{
        ...article,
        key_topics: parseKeyTopics(article.key_topics),
        gallery: parseGallery(article.gallery),
        published_at: toDateInputValue(article.published_at),
      }}
    />
  );
}
