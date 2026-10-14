import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { updateArticle } from "@/app/actions/articles";
import { ArticleForm } from "@/components/organisms/dashboard/ArticleForm";
import { parseKeyTopics } from "@/lib/keyTopics";
import { parseGallery } from "@/lib/gallery";
import { toDateInputValue } from "@/lib/articleDate";
import type { news } from "@prisma/client";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardUser();
  const { id } = await params;

  const [article, categories]: [news | null, { id: string; name: string }[]] = await Promise.all([
    prisma.news.findUnique({ where: { id } }),
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
        slug: article.slug,
        thumbnail_url: article.thumbnail_url,
        thumbnail_caption: article.thumbnail_caption ?? "",
        thumbnail_caption_id: article.thumbnail_caption_id ?? "",
        category_id: article.category_id,
        status: article.status,
        published_at: toDateInputValue(article.published_at),
        gallery: parseGallery(article.gallery),
        en: {
          title: article.title,
          excerpt: article.excerpt ?? "",
          content: article.content,
          key_topics_title: article.key_topics_title ?? "",
          key_topics: parseKeyTopics(article.key_topics),
          gallery_label: article.gallery_label ?? "",
          gallery_title: article.gallery_title ?? "",
        },
        id: {
          title: article.title_id ?? "",
          excerpt: article.excerpt_id ?? "",
          content: article.content_id ?? "",
          key_topics_title: article.key_topics_title_id ?? "",
          key_topics: parseKeyTopics(article.key_topics_id),
          gallery_label: article.gallery_label_id ?? "",
          gallery_title: article.gallery_title_id ?? "",
        },
      }}
    />
  );
}
