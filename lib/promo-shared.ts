// Promo types/helpers safe to use in the browser (no Prisma imports).
import { LOCALES, localizePath, type Locale } from "@/lib/i18n/config";

export type PromoShowOn = "HOME" | "ALL";

/** What the public popup needs (serializable, no internal fields). */
export type PublicPromo = {
  id: string;
  /** Changes when the promo is edited, so visitors who closed it see the new flyer */
  version: string;
  imageUrl: string;
  imageUrlId: string | null;
  ctaLabel: string | null;
  ctaLabelId: string | null;
  ctaUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  showOn: PromoShowOn;
};

/** Whether `now` is inside the promo's date window. */
export const isPromoLive = (p: PublicPromo, now = Date.now()) =>
  (!p.startsAt || Date.parse(p.startsAt) <= now) && (!p.endsAt || Date.parse(p.endsAt) >= now);

/** Site paths ("/register?…") get the visitor's language prefix; full URLs stay as they are. */
export function promoCtaHref(url: string | null, lang: Locale) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return url;
  // Already has a language prefix
  if (LOCALES.some((l) => new RegExp(`^/${l}([/?#]|$)`).test(url))) return url;
  return localizePath(lang, url);
}
