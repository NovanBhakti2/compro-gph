import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import type { Trainer } from "@/lib/certificates";
import { DeleteTrainerButton } from "@/components/organisms/dashboard/TrainingClient";
import { Card, EmptyState, Icon, PageHeader, buttonClass } from "@/components/organisms/dashboard/ui";

export default async function TrainersPage() {
  await requireAdmin();
  const trainers: (Trainer & { _count: { trainings: number } })[] = await prisma.trainers.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { trainings: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sertifikat"
        title="Trainer"
        description="Nama, jabatan, dan tanda tangan yang tercetak di sertifikat."
        actions={
          <>
            <Link href="/dashboard/trainings" className={buttonClass("secondary")}>
              <Icon name="back" />
              Training
            </Link>
            <Link href="/dashboard/trainers/new" className={buttonClass("primary")}>
              <Icon name="plus" />
              Trainer baru
            </Link>
          </>
        }
      />

      <Card bodyClassName="">
        {trainers.length === 0 ? (
          <EmptyState
            title="Belum ada trainer"
            description="Tambahkan trainer beserta tanda tangannya, lalu pilih di setiap training."
            action={{ href: "/dashboard/trainers/new", label: "Tambah trainer" }}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {trainers.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50/60">
                <div className="flex h-14 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                  {t.signature_url ? (
                    <img src={t.signature_url} alt="" className="max-h-full max-w-full object-contain p-1" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Tanpa tanda tangan</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/trainers/${t.id}`} className="text-sm font-semibold text-[#0f1932] hover:text-[#9c7d42]">
                    {t.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {t.title} · {t._count.trainings} training
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/trainers/${t.id}`} title="Edit" aria-label="Edit" className={buttonClass("ghost", "icon")}>
                    <Icon name="edit" />
                  </Link>
                  <DeleteTrainerButton id={t.id} name={t.name} count={t._count.trainings} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
