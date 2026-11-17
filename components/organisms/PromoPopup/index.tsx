"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PromoDialog } from "@/components/molecules/PromoDialog";
import { isPromoLive, promoCtaHref, type PublicPromo } from "@/lib/promo-shared";
import { stripLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const DELAY_MS = 3000;
const storageKey = (p: PublicPromo) => `gph-promo:${p.id}:${p.version}`;

function seen(p: PublicPromo) {
  try {
    return Boolean(sessionStorage.getItem(storageKey(p)));
  } catch {
    // Storage blocked (private mode): still show it, just not remembered
    return false;
  }
}

type Props = { promos: PublicPromo[]; lang: Locale; dict: Dictionary["promo"] };

/**
 * Shows the live flyers (as a slider when there are several) a few seconds
 * after the page loads, once per browser session: a closed flyer stays closed
 * until it's edited in the dashboard, and a new flyer still pops up.
 */
export function PromoPopup({ promos, lang, dict }: Props) {
  const pathname = usePathname();
  const [shown, setShown] = useState<PublicPromo[]>([]);

  useEffect(() => {
    const path = stripLocale(pathname);
    // Visitors on a certificate page came for one thing; don't interrupt
    if (path.startsWith("/claim/") || path.startsWith("/verify/")) return;
    const isHome = path === "/";
    const due =promos.filter((p) => isPromoLive(p) && (p.showOn === "ALL" || isHome) && !seen(p));
    if (due.length === 0) return;
    const timer = setTimeout(() => setShown(due), DELAY_MS);
    return () => clearTimeout(timer);
  }, [promos, pathname]);

  const dismiss = useCallback(() => {
    setShown((current) => {
      try {
        for (const p of current) sessionStorage.setItem(storageKey(p), "1");
      } catch {}
      return [];
    });
  }, []);

  if (shown.length === 0) return null;

  const isId = lang === "id";
  return (
    <PromoDialog
      slides={shown.map((p) => ({
        imageUrl: (isId && p.imageUrlId) || p.imageUrl,
        ctaLabel: (isId && p.ctaLabelId) || p.ctaLabel,
        ctaUrl: promoCtaHref(p.ctaUrl, lang),
      }))}
      imageAlt={dict.flyerAlt}
      closeLabel={dict.close}
      prevLabel={dict.previous}
      nextLabel={dict.next}
      onClose={dismiss}
      onCta={dismiss}
    />
  );
}
