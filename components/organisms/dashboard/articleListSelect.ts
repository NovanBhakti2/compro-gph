// Fields needed by <ArticleList />, shared by the dashboard queries
export const ARTICLE_LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
  updated_at: true,
  published_at: true,
  thumbnail_url: true,
  categories: { select: { name: true } },
  users: { select: { name: true } },
} as const;
