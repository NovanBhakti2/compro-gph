import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { ArticleList } from "@/components/organisms/dashboard/ArticleList";
import { ARTICLE_LIST_SELECT } from "@/components/organisms/dashboard/articleListSelect";
import {
  Card,
  Icon,
  PageHeader,
  buttonClass,
  type IconName,
} from "@/components/organisms/dashboard/ui";

const todayFormat = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const draftDateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jakarta",
});

export default async function DashboardPage() {
  const user = await requireDashboardUser();

  const [recent, drafts, counts, categoryCount] = await Promise.all([
    prisma.news.findMany({
      orderBy: { updated_at: "desc" },
      take: 5,
      select: ARTICLE_LIST_SELECT,
    }),
    prisma.news.findMany({
      where: { status: "DRAFT" },
      orderBy: { updated_at: "desc" },
      take: 4,
      select: { id: true, title: true, updated_at: true },
    }),
    prisma.news.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.categories.count(),
  ]);

  const countOf = (s: string) =>
    counts.find((c: { status: string }) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce(
    (sum: number, c: { _count: { _all: number } }) => sum + c._count._all,
    0
  );

  const stats: { label: string; value: number; href: string; icon: IconName; tone: string }[] = [
    { label: "Total artikel", value: total, href: "/dashboard/articles", icon: "articles", tone: "bg-[#0f1932]/[0.06] text-[#0f1932]" },
    { label: "Published", value: countOf("PUBLISHED"), href: "/dashboard/articles?status=PUBLISHED", icon: "check", tone: "bg-emerald-50 text-emerald-600" },
    { label: "Draft", value: countOf("DRAFT"), href: "/dashboard/articles?status=DRAFT", icon: "draft", tone: "bg-amber-50 text-amber-600" },
    { label: "Archived", value: countOf("ARCHIVED"), href: "/dashboard/articles?status=ARCHIVED", icon: "archive", tone: "bg-slate-100 text-slate-500" },
  ];

  const quickActions: { href: string; label: string; description: string; icon: IconName; external?: boolean }[] = [
    { href: "/dashboard/articles/new", label: "Tulis artikel", description: "Buat artikel atau berita baru", icon: "pen" },
    { href: "/dashboard/categories", label: "Kelola kategori", description: `${categoryCount} kategori`, icon: "tag" },
    { href: "/news", label: "Lihat website", description: "Halaman News & Articles", icon: "external", external: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayFormat.format(new Date())}
        title={`Halo, ${user.name.split(" ")[0]}`}
        description="Ringkasan konten News & Articles di website."
        actions={
          <Link href="/dashboard/articles/new" className={buttonClass("primary")}>
            <Icon name="plus" />
            Tulis artikel
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,25,50,0.04)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone}`}>
                <Icon name={stat.icon} />
              </span>
            </div>
            <p className="pt-3 text-3xl font-extrabold tracking-tight text-[#0f1932]">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card
          title="Terakhir diubah"
          description="5 artikel yang terakhir disunting"
          actions={
            <Link href="/dashboard/articles" className={buttonClass("ghost", "sm")}>
              Lihat semua
              <Icon name="right" className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName=""
        >
          <ArticleList articles={recent} compact />
        </Card>

        <div className="space-y-6">
          <Card title="Aksi cepat" bodyClassName="p-2">
            <ul>
              {quickActions.map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C7974C]/12 text-[#9c7d42]">
                      <Icon name={action.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#0f1932]">
                        {action.label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {action.description}
                      </span>
                    </span>
                    <Icon name="right" className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Draft"
            description={drafts.length ? "Lanjutkan tulisan yang belum terbit" : undefined}
            bodyClassName="p-2"
          >
            {drafts.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">
                Tidak ada draft. Semua artikel sudah terbit.
              </p>
            ) : (
              <ul>
                {drafts.map((draft: (typeof drafts)[number]) => (
                  <li key={draft.id}>
                    <Link
                      href={`/dashboard/articles/${draft.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                        {draft.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {draftDateFormat.format(draft.updated_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
