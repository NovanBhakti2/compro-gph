import { prisma } from "@/lib/prisma";

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
