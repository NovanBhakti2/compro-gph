import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { claimStatus, formatTrainingDate, type Training } from "@/lib/certificates";
import { purgeExpiredRegistrations } from "@/lib/registrations";
import { TrainingStatusBadge } from "@/components/organisms/dashboard/TrainingStatusBadge";
import { Card, EmptyState, Icon, PageHeader, buttonClass } from "@/components/organisms/dashboard/ui";

export default async function TrainingsPage() {
  await requireDashboardUser();
  // Also runs daily from the cron
  await purgeExpiredRegistrations();
  const trainings: (Training & { _count: { certificates: number; registrations: number } })[] =
    await prisma.trainings.findMany({
      orderBy: { starts_on: "desc" },
      include: { _count: { select: { certificates: true, registrations: true } } },
    });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pelatihan"
        title="Sertifikat"
        description="Buat training, tampilkan QR-nya ke peserta, dan sertifikat jadi saat mereka klaim."
        actions={
          <>
            <Link href="/dashboard/trainers" className={buttonClass("secondary")}>
              <Icon name="user" />
              Trainer
            </Link>
            <Link href="/dashboard/trainings/new" className={buttonClass("primary")}>
              <Icon name="plus" />
              Training baru
            </Link>
          </>
        }
      />

      <Card bodyClassName="">
        {trainings.length === 0 ? (
          <EmptyState
            title="Belum ada training"
            description="Buat training pertama untuk mendapatkan QR klaim sertifikat."
            action={{ href: "/dashboard/trainings/new", label: "Buat training" }}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {trainings.map((t) => {
              return (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/trainings/${t.id}`}
                    className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50/60"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C7974C]/12 text-[#8a6a32]">
                      <Icon name="award" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="line-clamp-1 text-sm font-semibold text-[#0f1932]">{t.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <TrainingStatusBadge status={claimStatus(t)} />
                        <span>{formatTrainingDate(t.starts_on, t.ends_on, "id-ID")}</span>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-lg font-extrabold text-[#0f1932]">
                        {t.registrations_purged_at ? (t.registrations_purged_count ?? 0) : t._count.registrations}
                      </p>
                      <p className="text-[11px] text-slate-400">pendaftar</p>
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-lg font-extrabold text-[#0f1932]">{t._count.certificates}</p>
                      <p className="text-[11px] text-slate-400">sertifikat</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
