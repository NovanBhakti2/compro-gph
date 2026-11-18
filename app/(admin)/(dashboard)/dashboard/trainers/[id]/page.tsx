import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { updateTrainer } from "@/app/actions/trainers";
import type { Trainer } from "@/lib/certificates";
import { TrainerForm } from "@/components/organisms/dashboard/TrainerForm";

export default async function EditTrainerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const trainer: Trainer | null = await prisma.trainers.findUnique({ where: { id } });
  if (!trainer) notFound();

  return (
    <TrainerForm
      heading="Edit trainer"
      action={updateTrainer.bind(null, id)}
      initialValues={{ name: trainer.name, title: trainer.title, signature_url: trainer.signature_url ?? "" }}
    />
  );
}
