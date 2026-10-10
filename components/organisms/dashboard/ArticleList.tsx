import Link from "next/link";
import { DeleteArticleButton } from "./DeleteArticleButton";
import { PublishToggle } from "./PublishToggle";
import { ShareButton } from "./ShareButton";
import { EmptyState, Icon, buttonClass } from "./ui";

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updated_at: Date;
  published_at: Date | null;
  thumbnail_url: string | null;
  categories: { name: string } | null;
  users: { name: string } | null;
};

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const COLUMNS = "md:grid-cols-[minmax(0,1fr)_130px_150px_110px_112px]";
// Narrow variant for the overview card: category & date move under the title
const COMPACT_COLUMNS = "md:grid-cols-[minmax(0,1fr)_140px_112px]";

export function ArticleList({
  articles,
  emptyAction = true,
  compact = false,
}: {
  articles: ArticleListItem[];
  emptyAction?: boolean;
  compact?: boolean;
}) {
  const columns = compact ? COMPACT_COLUMNS : COLUMNS;

  if (articles.length === 0) {
    return (
      <EmptyState
        title="Belum ada artikel"
        description="Artikel yang cocok akan muncul di sini."
        action={emptyAction ? { href: "/dashboard/articles/new", label: "Tulis artikel" } : undefined}
      />
    );
  }

  return (
    <div>
      <div
        className={`hidden gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:grid ${columns}`}
      >
        <span>Artikel</span>
        {!compact && <span>Kategori</span>}
        <span>Status</span>
        {!compact && <span>Tanggal</span>}
        <span className="text-right">Aksi</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {articles.map((article) => {
          const published = article.status === "PUBLISHED";
          return (
            <li
              key={article.id}
              className={`grid grid-cols-1 items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60 md:gap-4 ${columns}`}
            >
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/60">
                  {article.thumbnail_url ? (
                    <img src={article.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Icon name="image" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/articles/${article.id}`}
                    className="line-clamp-1 text-sm font-semibold text-[#0f1932] hover:text-[#9c7d42]"
                  >
                    {article.title}
                  </Link>
                  <p className="truncate text-xs text-slate-400">
                    {compact ? (
                      <>
                        {article.categories?.name ?? "Tanpa kategori"}
                        {article.published_at && <> &middot; {dateFormat.format(article.published_at)}</>}
                      </>
                    ) : (
                      <>
                        {article.users?.name} &middot; diubah {dateFormat.format(article.updated_at)}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:contents">
                {!compact && (
                  <span className="w-fit truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {article.categories?.name ?? "Tanpa kategori"}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <PublishToggle id={article.id} published={published} />
                  {article.status === "ARCHIVED" && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                      Arsip
                    </span>
                  )}
                </div>

                {!compact && (
                  <span className="text-xs text-slate-500 md:text-sm">
                    {article.published_at ? dateFormat.format(article.published_at) : "—"}
                  </span>
                )}

                <div className="ml-auto flex items-center gap-0.5 md:justify-end">
                  {published && <ShareButton slug={article.slug} title={article.title} />}
                  <Link
                    href={`/dashboard/articles/${article.id}`}
                    title="Edit"
                    aria-label="Edit"
                    className={buttonClass("ghost", "icon")}
                  >
                    <Icon name="edit" />
                  </Link>
                  <DeleteArticleButton id={article.id} title={article.title} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
