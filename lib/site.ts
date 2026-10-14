/** Public site info used for metadata, sitemap and share previews. */
export const SITE = {
  name: "Gama Putra Harmoni",
  // Override per environment with NEXT_PUBLIC_SITE_URL if the domain changes
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gamaputraharmoni.com",
  description:
    "Konsultan dan pelatihan profesional untuk hospitality: food safety, halal assurance, quality assurance, 5S, dan perizinan usaha.",
  locale: "id_ID",
} as const;

// Must match images.remotePatterns in next.config.ts
const OPTIMIZABLE_HOSTS = [/^images\.unsplash\.com$/, /\.public\.blob\.vercel-storage\.com$/];

/**
 * Share-preview image URL. Photos go through the Next.js image optimizer at
 * 1200px, because WhatsApp and others skip previews for multi-MB images.
 * Hosts the optimizer doesn't allow are returned unchanged.
 */
export function shareImageUrl(src: string) {
  const isLocal = src.startsWith("/") && !src.startsWith("//");
  let allowed = isLocal;
  if (!isLocal) {
    try {
      const { hostname } = new URL(src);
      allowed = OPTIMIZABLE_HOSTS.some((pattern) => pattern.test(hostname));
    } catch {
      return src;
    }
  }
  return allowed ? `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75` : src;
}
