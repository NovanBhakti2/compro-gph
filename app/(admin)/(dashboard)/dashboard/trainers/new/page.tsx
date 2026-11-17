import { requireDashboardUser } from "@/lib/dal";
import { createTrainer } from "@/app/actions/trainers";
import { TrainerForm } from "@/components/organisms/dashboard/TrainerForm";

export default async function NewTrainerPage() {
  await requireDashboardUser();
  return <TrainerForm heading="Trainer baru" action={createTrainer} />;
}
