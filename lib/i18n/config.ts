/**
 * English is served without a prefix (/news), Indonesian under /id (/id/news).
 * proxy.ts rewrites unprefixed URLs to the internal /en route.
 */
export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Public URL for a path in a locale: ("id", "/news") → "/id/news", ("id", "/#about") → "/id#about". */
export function localizePath(locale: Locale, path: string) {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/**
 * Path without the locale prefix: "/id/news" → "/news", "/id" → "/".
 * Also strips "/en": during server rendering usePathname() returns the
 * rewritten "/en/news" while the browser sees "/news"; both must match or
 * hydration fails.
 */
export function stripLocale(pathname: string) {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** hreflang map for metadata `alternates.languages` and the sitemap. */
export function languageAlternates(path: string) {
  return {
    en: localizePath("en", path),
    id: localizePath("id", path),
    "x-default": localizePath(DEFAULT_LOCALE, path),
  };
}
