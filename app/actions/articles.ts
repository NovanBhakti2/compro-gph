"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { slugify } from "@/lib/slugify";
import { parseKeyTopics } from "@/lib/keyTopics";
import { parseGallery } from "@/lib/gallery";
import { fromDateInputValue } from "@/lib/articleDate";

const ArticleSchema = z.object({
  title: z.string().trim().min(3, { error: "Judul minimal 3 karakter." }).max(255),
  slug: z
    .string()
    .trim()
    .max(255)
    .transform(slugify)
    .pipe(z.string().min(1, { error: "Slug wajib diisi." })),
  excerpt: z
    .string()
    .trim()
    .max(500, { error: "Ringkasan maksimal 500 karakter." })
    .transform((v) => v || null),
  content: z.string().trim().min(1, { error: "Konten wajib diisi." }),
  // Full URL or a path inside /public, e.g. /content/foto.jpg
  thumbnail_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^(https?:\/\/|\/)\S+$/.test(v), {
      error: "Isi dengan URL (https://...) atau path (/content/...).",
    })
    .transform((v) => v || null),
  category_id: z.string().transform((v) => v || null),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  // "YYYY-MM-DD"; empty = set automatically when published
  published_at: z
    .string()
    .trim()
    .refine((v) => !v || fromDateInputValue(v), { error: "Tanggal tidak valid." })
    .transform((v) => (v ? fromDateInputValue(v) : null)),
  key_topics_title: z
    .string()
    .trim()
    .max(255, { error: "Maksimal 255 karakter." })
    .transform((v) => v || null),
  key_topics: z.array(z.object({ title: z.string(), description: z.string() })),
  gallery_label: z
    .string()
    .trim()
    .max(100, { error: "Maksimal 100 karakter." })
    .transform((v) => v || null),
  gallery_title: z
    .string()
    .trim()
    .max(255, { error: "Maksimal 255 karakter." })
    .transform((v) => v || null),
  gallery: z.array(
    z.object({
      url: z.string().regex(/^(https?:\/\/|\/)\S+$/, { error: "URL foto galeri tidak valid." }),
      alt: z.string().max(255),
    })
  ),
});

export type ArticleFormState =
  | {
      message?: string;
      errors?: Partial<Record<keyof z.infer<typeof ArticleSchema>, string[]>>;
    }
  | undefined;

function parseArticle(formData: FormData) {
  return ArticleSchema.safeParse({
    title: formData.get("title") ?? "",
    slug: formData.get("slug") || formData.get("title") || "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    thumbnail_url: formData.get("thumbnail_url") ?? "",
    category_id: formData.get("category_id") ?? "",
    status: formData.get("status") ?? "DRAFT",
    published_at: formData.get("published_at") ?? "",
    key_topics_title: formData.get("key_topics_title") ?? "",
    key_topics: parseKeyTopics(
      formData.getAll("key_topic_title").map((title, i) => ({
        title,
        description: formData.getAll("key_topic_description")[i] ?? "",
      }))
    ),
    gallery_label: formData.get("gallery_label") ?? "",
    gallery_title: formData.get("gallery_title") ?? "",
    gallery: parseGallery(
      formData.getAll("gallery_url").map((url, i) => ({
        url,
        alt: formData.getAll("gallery_alt")[i] ?? "",
      }))
    ),
  });
}

function isUniqueSlugError(error: unknown) {
  return (error as { code?: string })?.code === "P2002";
}

function revalidateArticle(...slugs: string[]) {
  revalidatePath("/news");
  revalidatePath("/api/news");
  slugs.forEach((slug) => revalidatePath(`/news/${slug}`));
  revalidatePath("/dashboard", "layout");
}

export async function createArticle(
  _state: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const user = await requireDashboardUser();
  const parsed = parseArticle(formData);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  try {
    await prisma.news.create({
      data: {
        ...data,
        author_id: user.id,
        published_at: data.published_at ?? (data.status === "PUBLISHED" ? new Date() : null),
      },
    });
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { errors: { slug: ["Slug sudah dipakai artikel lain."] } };
    }
    console.error("createArticle:", error);
    return { message: "Gagal menyimpan artikel." };
  }

  revalidateArticle(data.slug);
  redirect("/dashboard/articles");
}

export async function updateArticle(
  id: string,
  _state: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireDashboardUser();
  const parsed = parseArticle(formData);

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const existing = await prisma.news.findUnique({
    where: { id },
    select: { slug: true, published_at: true },
  });
  if (!existing) return { message: "Artikel tidak ditemukan." };

  const data = parsed.data;
  try {
    await prisma.news.update({
      where: { id },
      data: {
        ...data,
        // A date picked in the form wins; otherwise keep the original publish
        // date, or set it the first time the article goes live
        published_at:
          data.published_at ??
          (data.status === "PUBLISHED"
            ? existing.published_at ?? new Date()
            : existing.published_at),
      },
    });
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { errors: { slug: ["Slug sudah dipakai artikel lain."] } };
    }
    console.error("updateArticle:", error);
    return { message: "Gagal menyimpan artikel." };
  }

  revalidateArticle(existing.slug, data.slug);
  redirect("/dashboard/articles");
}

export async function deleteArticle(id: string) {
  await requireDashboardUser();

  const deleted = await prisma.news
    .delete({ where: { id }, select: { slug: true } })
    .catch(() => null);

  if (deleted) revalidateArticle(deleted.slug);
}

/** Publish / unpublish dari daftar artikel tanpa membuka form. */
export async function togglePublish(id: string) {
  await requireDashboardUser();

  const article = await prisma.news.findUnique({
    where: { id },
    select: { slug: true, status: true, published_at: true },
  });
  if (!article) return;

  const publish = article.status !== "PUBLISHED";
  await prisma.news.update({
    where: { id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      published_at: publish ? article.published_at ?? new Date() : article.published_at,
    },
  });

  revalidateArticle(article.slug);
}
