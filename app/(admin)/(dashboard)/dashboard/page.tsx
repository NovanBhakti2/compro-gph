import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { claimStatus, formatTrainingDate, type Training } from "@/lib/certificates";
import { isRegistrationOpen } from "@/lib/registrations";
import { promoStatus, type Promo } from "@/lib/promos";
import { ArticleList } from "@/components/organisms/dashboard/ArticleList";
import { ARTICLE_LIST_SELECT } from "@/components/organisms/dashboard/articleListSelect";
import { Card, Icon, PageHeader, buttonClass, type IconName } from "@/components/organisms/dashboard/ui";

const todayFormat = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jakarta",
});

type TrainingRow = Training & { _count: { registrations: number; certificates: number } };

/** Where a training is in its life: sign-ups, then claims, then done. */
function trainingPhase(t: TrainingRow, now: Date) {
  if (isRegistrationOpen(t, now)) return { label: "Pendaftaran dibuka", className: "bg-sky-50 text-sky-700" };
  if (claimStatus(t, now) === "OPEN") return { label: "Masa klaim", className: "bg-emerald-50 text-emerald-700" };
  return null;
}

export default async function DashboardPage() {
  const user = await requireDashboardUser();
  const now = new Date();
  const monthStart = new Date(
    `${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit" }).format(now)}-01T00:00:00+07:00`
  );

  const [recent, drafts, counts, trainings, certificateCount, certificatesThisMonth, promos] = await Promise.all([
    prisma.news.findMany({ orderBy: { updated_at: "desc" }, take: 5, select: ARTICLE_LIST_SELECT }),
    prisma.news.findMany({
      where: { status: "DRAFT" },
      orderBy: { updated_at: "desc" },
      take: 4,
      select: { id: true, title: true, updated_at: true },
    }),
    prisma.news.groupBy({ by: ["status"], _count: { _all: true } }),
    // Trainings whose sign-up data still exists: the ones still in progress
    prisma.trainings.findMany({
      where: { registrations_purged_at: null },
      orderBy: { starts_on: "asc" },
      include: { _count: { select: { registrations: true, certificates: true } } },
    }) as Promise<TrainingRow[]>,
    prisma.certificates.count(),
    prisma.certificates.count({ where: { created_at: { gte: monthStart } } }),
    prisma.promos.findMany({ where: { is_active: true }, orderBy: { updated_at: "desc" } }) as Promise<Promo[]>,
  ]);

  const countOf = (s: string) => counts.find((c: { status: string }) => c.status === s)?._count._all ?? 0;

  const activeTrainings = trainings
    .map((t) => ({ ...t, phase: trainingPhase(t, now) }))
    .filter((t) => t.phase !== null);
  const openForSignUp = activeTrainings.filter((t) => isRegistrationOpen(t, now)).length;
  const registrants = activeTrainings.reduce((sum, t) => sum + t._count.registrations, 0);

  const livePromos = promos.filter((p) => promoStatus(p, now) === "LIVE");
  const scheduledPromos = promos.filter((p) => promoStatus(p, now) === "SCHEDULED");
  const shownPromos = [...livePromos, ...scheduledPromos].slice(0, 4);

  const stats: { label: string; value: number; hint: string; href: string; icon: IconName; tone: string }[] = [
    {
      label: "Artikel terbit",
      value: countOf("PUBLISHED"),
      hint: `${countOf("DRAFT")} draft`,
      href: "/dashboard/articles?status=PUBLISHED",
      icon: "articles",
      tone: "bg-[#0f1932]/[0.06] text-[#0f1932]",
    },
    {
      label: "Training aktif",
      value: activeTrainings.length,
      hint: `${openForSignUp} buka pendaftaran`,
      href: "/dashboard/trainings",
      icon: "calendar",
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Pendaftar",
      value: registrants,
      hint: "di training aktif",
      href: "/dashboard/trainings",
      icon: "user",
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Sertifikat terbit",
      value: certificateCount,
      hint: `${certificatesThisMonth} bulan ini`,
      href: "/dashboard/trainings",
      icon: "award",
      tone: "bg-[#C7974C]/12 text-[#9c7d42]",
    },
    {
      label: "Promo tayang",
      value: livePromos.length,
      hint: `${scheduledPromos.length} terjadwal`,
      href: "/dashboard/promos",
      icon: "megaphone",
      tone: "bg-rose-50 text-rose-600",
    },
  ];

  const quickActions: { href: string; label: string; description: string; icon: IconName; external?: boolean }[] = [
    { href: "/dashboard/articles/new", label: "Tulis artikel", description: "Artikel atau berita baru", icon: "pen" },
    { href: "/dashboard/trainings/new", label: "Training baru", description: "Pendaftaran & sertifikat", icon: "award" },
    { href: "/dashboard/promos/new", label: "Promo baru", description: "Flyer pop-up & section promo", icon: "megaphone" },
    { href: "/", label: "Lihat website", description: "Buka beranda", icon: "external", external: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayFormat.format(now)}
        title={`Halo, ${user.name.split(" ")[0]}`}
        description="Ringkasan artikel, training, dan promo di website."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(15,25,50,0.04)] transition last:col-span-2 hover:-translate-y-0.5 hover:shadow-md sm:p-5 sm:last:col-span-1"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <Icon name={stat.icon} />
              </span>
            </div>
            <p className="pt-3 text-3xl font-extrabold tracking-tight text-[#0f1932]">{stat.value}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card
            title="Training berjalan"
            description="Yang sedang buka pendaftaran atau masih dalam masa klaim sertifikat"
            actions={
              <Link href="/dashboard/trainings" className={buttonClass("ghost", "sm")}>
                Lihat semua
                <Icon name="right" className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName=""
          >
            {activeTrainings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-500">Belum ada training yang berjalan.</p>
                <Link href="/dashboard/trainings/new" className={`${buttonClass("primary", "sm")} mt-3`}>
                  <Icon name="plus" />
                  Buat training
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activeTrainings.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/trainings/${t.id}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 hover:bg-slate-50/60"
                    >
                      <div className="min-w-0 flex-1 basis-56 space-y-1">
                        <p className="truncate text-sm font-semibold text-[#0f1932]">{t.title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.phase!.className}`}>
                            {t.phase!.label}
                          </span>
                          <span>{formatTrainingDate(t.starts_on, t.ends_on, "id-ID")}</span>
                        </div>
                      </div>
                      <div className="flex gap-5 text-right">
                        <div>
                          <p className="text-base font-extrabold text-[#0f1932]">{t._count.registrations}</p>
                          <p className="text-[11px] text-slate-400">pendaftar</p>
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-[#0f1932]">{t._count.certificates}</p>
                          <p className="text-[11px] text-slate-400">sertifikat</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Artikel terakhir diubah"
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
        </div>

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
                      <span className="block text-sm font-semibold text-[#0f1932]">{action.label}</span>
                      <span className="block truncate text-xs text-slate-500">{action.description}</span>
                    </span>
                    <Icon name="right" className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Promo"
            description={shownPromos.length ? "Yang sedang tayang dan terjadwal" : undefined}
            actions={
              <Link href="/dashboard/promos" className={buttonClass("ghost", "sm")}>
                Kelola
              </Link>
            }
            bodyClassName="p-2"
          >
            {shownPromos.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Tidak ada promo yang tayang.</p>
            ) : (
              <ul>
                {shownPromos.map((p) => {
                  const live = promoStatus(p, now) === "LIVE";
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/promos/${p.id}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50"
                      >
                        <img
                          src={p.image_url}
                          alt=""
                          className="h-12 w-10 shrink-0 rounded-md object-cover object-top ring-1 ring-slate-200"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-700">{p.title}</span>
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-sky-400"}`} />
                            {live
                              ? p.ends_at
                                ? `Tayang s.d. ${shortDate.format(p.ends_at)}`
                                : "Tayang"
                              : `Mulai ${shortDate.format(p.starts_at!)}`}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Draft artikel"
            description={drafts.length ? "Lanjutkan tulisan yang belum terbit" : undefined}
            bodyClassName="p-2"
          >
            {drafts.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Tidak ada draft. Semua artikel sudah terbit.</p>
            ) : (
              <ul>
                {drafts.map((draft: (typeof drafts)[number]) => (
                  <li key={draft.id}>
                    <Link
                      href={`/dashboard/articles/${draft.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{draft.title}</span>
                      <span className="shrink-0 text-[11px] text-slate-400">{shortDate.format(draft.updated_at)}</span>
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
