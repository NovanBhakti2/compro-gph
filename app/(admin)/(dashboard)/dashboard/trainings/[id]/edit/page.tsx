import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { updateTraining } from "@/app/actions/certificates";
import { dateToInput, timeToInput, type Trainer, type Training } from "@/lib/certificates";
import { toDateInputValue } from "@/lib/promos";
import { TrainingForm } from "@/components/organisms/dashboard/TrainingForm";

export default async function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const training: Training | null = await prisma.trainings.findUnique({ where: { id } });
  if (!training) notFound();
  const trainers: Trainer[] = await prisma.trainers.findMany({ orderBy: { name: "asc" } });

  return (
    <TrainingForm
      heading="Edit training"
      backHref={`/dashboard/trainings/${id}`}
      action={updateTraining.bind(null, id)}
      trainers={trainers.map((t) => ({ id: t.id, name: t.name, title: t.title, hasSignature: Boolean(t.signature_url) }))}
      initialValues={{
        title: training.title,
        starts_on: dateToInput(training.starts_on),
        ends_on: dateToInput(training.ends_on),
        // claim_until is a moment; show its WIB day and time
        claim_until: toDateInputValue(training.claim_until),
        claim_time: training.claim_until ? timeToInput(training.claim_until) : "23:59",
        time_start: training.time_start ?? "",
        time_end: training.time_end ?? "",
        location: training.location ?? "",
        is_open: training.is_open,
        registration_open: training.registration_open,
        trainer_id: training.trainer_id ?? "",
      }}
    />
  );
}
