export type KeyTopic = { title: string; description: string };

/** Normalizes the `news.key_topics` JSON column into a clean list. */
export function parseKeyTopics(value: unknown): KeyTopic[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      title: String(item?.title ?? "").trim(),
      description: String(item?.description ?? "").trim(),
    }))
    .filter((item) => item.title || item.description);
}
