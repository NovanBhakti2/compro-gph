import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { updatePromo } from "@/app/actions/promos";
import { PromoForm } from "@/components/organisms/dashboard/PromoForm";
import { getPromoTrainingOptions, toDateInputValue, type Promo } from "@/lib/promos";

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireDashboardUser();
  const { id } = await params;
  const promo: Promo | null = await prisma.promos.findUnique({ where: { id } });
  if (!promo) notFound();

  return (
    <PromoForm
      heading="Edit promo"
      action={updatePromo.bind(null, id)}
      trainings={await getPromoTrainingOptions(promo.training_id)}
      initialValues={{
        title: promo.title,
        image_url: promo.image_url,
        image_url_id: promo.image_url_id ?? "",
        cta_label: promo.cta_label ?? "",
        cta_label_id: promo.cta_label_id ?? "",
        cta_url: promo.cta_url ?? "",
        starts_at: toDateInputValue(promo.starts_at),
        ends_at: toDateInputValue(promo.ends_at),
        show_on: promo.show_on === "ALL" ? "ALL" : "HOME",
        show_popup: promo.show_popup,
        show_in_news: promo.show_in_news,
        is_active: promo.is_active,
        training_id: promo.training_id ?? "",
      }}
    />
  );
}
