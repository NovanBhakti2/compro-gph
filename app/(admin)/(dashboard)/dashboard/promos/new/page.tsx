import { requireDashboardUser } from "@/lib/dal";
import { getPromoTrainingOptions } from "@/lib/promos";
import { createPromo } from "@/app/actions/promos";
import { PromoForm } from "@/components/organisms/dashboard/PromoForm";

export default async function NewPromoPage() {
  await requireDashboardUser();
  return <PromoForm heading="Promo baru" action={createPromo} trainings={await getPromoTrainingOptions()} />;
}
