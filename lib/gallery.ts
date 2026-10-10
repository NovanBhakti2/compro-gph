export type GalleryImage = { url: string; alt: string };

/** Normalizes the `news.gallery` JSON column into a clean list. */
export function parseGallery(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      url: String(item?.url ?? "").trim(),
      alt: String(item?.alt ?? "").trim(),
    }))
    .filter((item) => item.url);
}
