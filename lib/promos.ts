import { prisma } from "@/lib/prisma";
import type { promos } from "@prisma/client";
import { toDateInputValue } from "@/lib/articleDate";
import { isPromoLive, type PublicPromo } from "@/lib/promo-shared";
import { formatTrainingDate, type Training } from "@/lib/certificates";
import { isRegistrationOpen, openRegistrationWhere } from "@/lib/registrations";

export type { PromoShowOn, PublicPromo } from "@/lib/promo-shared";

export type Promo = promos;

// Promo dates are calendar days in WIB: start at 00:00, end at 23:59:59.
export const startOfDayWib = (value: string) => new Date(`${value}T00:00:00+07:00`);
export const endOfDayWib = (value: string) => new Date(`${value}T23:59:59.999+07:00`);
export { toDateInputValue };

export type PromoStatus = "LIVE" | "SCHEDULED" | "ENDED" | "OFF";

export function promoStatus(
  promo: Pick<Promo, "is_active" | "starts_at" | "ends_at">,
  now = new Date()
): PromoStatus {
  if (!promo.is_active) return "OFF";
  if (promo.starts_at && promo.starts_at > now) return "SCHEDULED";
  if (promo.ends_at && promo.ends_at < now) return "ENDED";
  return "LIVE";
}

export type PromoPlacement = "popup" | "news";

/**
 * Promos that may show in a placement: active and not yet ended, newest edit first. Ones that
 * haven't started are included because the public pages are cached; the popup
 * picks the first one inside its date window in the browser, so a flyer
 * appears and disappears on time without a redeploy.
 */
export async function getPublicPromos(placement: PromoPlacement): Promise<PublicPromo[]> {
  try {
    const now = new Date();
    const rows: (Promo & { training: { slug: string } | null })[] = await prisma.promos.findMany({
      where: {
        is_active: true,
        ...(placement === "popup" ? { show_popup: true } : { show_in_news: true }),
        OR: [{ ends_at: null }, { ends_at: { gte: now } }],
      },
      orderBy: { updated_at: "desc" },
      take: 10,
      include: { training: { select: { slug: true } } },
    });
    return rows.map((promo) => ({
      id: promo.id,
      version: promo.updated_at.getTime().toString(36),
      imageUrl: promo.image_url,
      imageUrlId: promo.image_url_id,
      // A linked training opens its sign-up form, with a default button text
      ctaLabel: promo.cta_label || (promo.training ? "Register now" : null),
      ctaLabelId: promo.cta_label_id || (promo.training ? "Daftar sekarang" : null),
      ctaUrl: promo.training ? `/register?training=${promo.training.slug}` : promo.cta_url,
      startsAt: promo.starts_at?.toISOString() ?? null,
      endsAt: promo.ends_at?.toISOString() ?? null,
      showOn: promo.show_on === "ALL" ? "ALL" : "HOME",
    }));
  } catch (error) {
    // Never break the public site because of a promo
    console.error("getPublicPromos:", error);
    return [];
  }
}

/**
 * Live flyers for the news page section. Filtered here rather than in the
 * browser: the page refreshes every few minutes, which is precise enough.
 */
export async function getLiveNewsPromos(): Promise<PublicPromo[]> {
  return (await getPublicPromos("news")).filter((promo) => isPromoLive(promo));
}

export type PromoTrainingOption = { id: string; label: string; open: boolean };

/** Trainings a promo can link to: those open for sign-up, plus the one already linked. */
export async function getPromoTrainingOptions(currentId?: string | null): Promise<PromoTrainingOption[]> {
  const trainings: Training[] = await prisma.trainings.findMany({
    where: { OR: [openRegistrationWhere(), ...(currentId ? [{ id: currentId }] : [])] },
    orderBy: { starts_on: "asc" },
  });
  return trainings.map((t) => ({
    id: t.id,
    label: `${t.title} · ${formatTrainingDate(t.starts_on, t.ends_on, "id-ID")}`,
    open: isRegistrationOpen(t),
  }));
}
