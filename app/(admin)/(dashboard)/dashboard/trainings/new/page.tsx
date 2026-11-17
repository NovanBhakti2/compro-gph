import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import type { Trainer } from "@/lib/certificates";
import { createTraining } from "@/app/actions/certificates";
import { TrainingForm } from "@/components/organisms/dashboard/TrainingForm";

export default async function NewTrainingPage() {
  await requireDashboardUser();
  const trainers: Trainer[] = await prisma.trainers.findMany({ orderBy: { name: "asc" } });
  return (
    <TrainingForm
      heading="Training baru"
      backHref="/dashboard/trainings"
      action={createTraining}
      trainers={trainers.map((t) => ({ id: t.id, name: t.name, title: t.title, hasSignature: Boolean(t.signature_url) }))}
    />
  );
}
