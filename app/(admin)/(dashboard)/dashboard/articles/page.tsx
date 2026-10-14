import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { ArticleList } from "@/components/organisms/dashboard/ArticleList";
import { ARTICLE_LIST_SELECT } from "@/components/organisms/dashboard/articleListSelect";
import { Card, Icon, PageHeader, buttonClass } from "@/components/organisms/dashboard/ui";

const FILTERS = [
  { label: "Semua", value: undefined },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
] as const;

type StatusFilter = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; category?: string }>;
}) {
  await requireDashboardUser();
  const { status: rawStatus, q = "", category: categoryId } = await searchParams;
  const status = FILTERS.some((f) => f.value === rawStatus)
    ? (rawStatus as StatusFilter)
    : undefined;
  const query = q.trim();

  const category = categoryId
    ? await prisma.categories.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true },
      })
    : null;

  // Tab counts follow the search and category filters, not the status tab
  const baseWhere = {
    ...(category && { category_id: category.id }),
    ...(query && { title: { contains: query, mode: "insensitive" as const } }),
  };

  const [articles, counts] = await Promise.all([
    prisma.news.findMany({
      where: { ...baseWhere, ...(status && { status }) },
      orderBy: { updated_at: "desc" },
      select: ARTICLE_LIST_SELECT,
    }),
    prisma.news.groupBy({ by: ["status"], where: baseWhere, _count: { _all: true } }),
  ]);

  const countOf = (value?: string) =>
    counts
      .filter((c: { status: string }) => !value || c.status === value)
      .reduce((sum: number, c: { _count: { _all: number } }) => sum + c._count._all, 0);

  const buildHref = (opts: { status?: string; q?: string; category?: string }) => {
    const params = new URLSearchParams();
    if (opts.status) params.set("status", opts.status);
    if (opts.q) params.set("q", opts.q);
    if (opts.category) params.set("category", opts.category);
    const qs = params.toString();
    return qs ? `/dashboard/articles?${qs}` : "/dashboard/articles";
  };
  const current = { status, q: query, category: category?.id };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="News & Articles"
        title="Semua artikel"
        description="Kelola, publikasikan, dan bagikan artikel."
        actions={
          <Link href="/dashboard/articles/new" className={buttonClass("primary")}>
            <Icon name="plus" />
            Tulis artikel
          </Link>
        }
      />

      <Card bodyClassName="">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1">
            {FILTERS.map((f) => {
              const active = f.value === status;
              return (
                <Link
                  key={f.label}
                  href={buildHref({ ...current, status: f.value })}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#0f1932] text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-md px-1.5 text-[11px] ${
                      active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {countOf(f.value)}
                  </span>
                </Link>
              );
            })}
          </nav>

          <form className="relative w-full sm:w-64">
            {status && <input type="hidden" name="status" value={status} />}
            {category && <input type="hidden" name="category" value={category.id} />}
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Cari judul..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm outline-none transition focus:border-[#C7974C] focus:bg-white focus:ring-4 focus:ring-[#C7974C]/15"
            />
          </form>
        </div>

        {(category || query) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5 text-xs text-slate-500">
            <span>Filter:</span>
            {category && (
              <Link
                href={buildHref({ ...current, category: undefined })}
                className="inline-flex items-center gap-1 rounded-md bg-[#C7974C]/12 px-2 py-1 font-semibold text-[#8a6a32] hover:bg-[#C7974C]/20"
              >
                Kategori: {category.name}
                <Icon name="x" className="h-3 w-3" />
              </Link>
            )}
            {query && (
              <Link
                href={buildHref({ ...current, q: undefined })}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600 hover:bg-slate-200"
              >
                &ldquo;{query}&rdquo;
                <Icon name="x" className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        <ArticleList articles={articles} emptyAction={!query && !category && !status} />

        {articles.length > 0 && (
          <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            Menampilkan {articles.length} artikel
          </p>
        )}
      </Card>
    </div>
  );
}
