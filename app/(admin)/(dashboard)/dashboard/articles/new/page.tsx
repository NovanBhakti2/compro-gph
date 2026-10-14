import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { createArticle } from "@/app/actions/articles";
import { ArticleForm } from "@/components/organisms/dashboard/ArticleForm";

export default async function NewArticlePage() {
  await requireDashboardUser();
  const categories = await prisma.categories.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <ArticleForm heading="Artikel baru" action={createArticle} categories={categories} />;
}
