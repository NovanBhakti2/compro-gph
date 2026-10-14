// app/[lang]/news/loading.tsx
import { lang } from "next/root-params";
import { NewsSkeleton } from "@/components/atoms/loading";
import { getDictionary } from "@/lib/i18n";

// loading.tsx gets no params; the locale comes from the root [lang] segment
export default async function Loading() {
  return <NewsSkeleton label={getDictionary((await lang()) ?? "en").news.loading} />;
}
