import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { promoStatus, type Promo, type PromoStatus } from "@/lib/promos";
import { PromoActions } from "@/components/organisms/dashboard/PromoActions";
import { Card, EmptyState, Icon, PageHeader, buttonClass } from "@/components/organisms/dashboard/ui";

const STATUS: Record<PromoStatus, { label: string; className: string }> = {
  LIVE: { label: "Sedang tayang", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  SCHEDULED: { label: "Terjadwal", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  ENDED: { label: "Berakhir", className: "bg-slate-100 text-slate-500 ring-slate-200" },
  OFF: { label: "Nonaktif", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function period(p: Promo) {
  if (!p.starts_at && !p.ends_at) return "Tanpa batas waktu";
  const from = p.starts_at ? dateFormat.format(p.starts_at) : "sekarang";
  const to = p.ends_at ? dateFormat.format(p.ends_at) : "seterusnya";
  return `${from} – ${to}`;
}

function placement(p: Promo) {
  const where = [];
  if (p.show_popup) where.push(p.show_on === "ALL" ? "Pop-up semua halaman" : "Pop-up beranda");
  if (p.show_in_news) where.push("Section News");
  return where.join(" + ");
}

export default async function PromosPage() {
  await requireDashboardUser();
  const promos: Promo[] = await prisma.promos.findMany({ orderBy: { updated_at: "desc" } });
  const now = new Date();
  const livePopups = promos.filter((p) => p.show_popup && promoStatus(p, now) === "LIVE").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Website"
        title="Pop-up Promo"
        description="Flyer yang tampil sebagai pop-up dan di section Program & Pelatihan halaman News."
        actions={
          <Link href="/dashboard/promos/new" className={buttonClass("primary")}>
            <Icon name="plus" />
            Promo baru
          </Link>
        }
      />

      {livePopups > 1 && (
        <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
          Ada {livePopups} pop-up yang sedang tayang. Semuanya tampil dalam satu pop-up yang bisa digeser, urut dari
          yang paling baru diubah.
        </p>
      )}

      <Card bodyClassName="">
        {promos.length === 0 ? (
          <EmptyState
            title="Belum ada promo"
            description="Upload flyer pertama Anda untuk ditampilkan sebagai pop-up."
            action={{ href: "/dashboard/promos/new", label: "Buat promo" }}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {promos.map((p) => {
              const status = STATUS[promoStatus(p, now)];
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50/60">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/60">
                    <img src={p.image_url} alt="" className="h-full w-full object-cover object-top" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      href={`/dashboard/promos/${p.id}`}
                      className="line-clamp-1 text-sm font-semibold text-[#0f1932] hover:text-[#9c7d42]"
                    >
                      {p.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${status.className}`}>
                        {status.label}
                      </span>
                      <span>{period(p)}</span>
                      <span>{placement(p)}</span>
                      {p.image_url_id && <span className="font-semibold text-emerald-700">+ versi ID</span>}
                    </div>
                  </div>
                  <PromoActions id={p.id} title={p.title} active={p.is_active} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
