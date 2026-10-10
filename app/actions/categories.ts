"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { slugify } from "@/lib/slugify";

const CategorySchema = z.object({
  name: z.string().trim().min(2, { error: "Nama minimal 2 karakter." }).max(100),
  slug: z
    .string()
    .trim()
    .max(100)
    .transform(slugify)
    .pipe(z.string().min(1, { error: "Slug wajib diisi." })),
  description: z
    .string()
    .trim()
    .max(255, { error: "Deskripsi maksimal 255 karakter." })
    .transform((v) => v || null),
});

export type CategoryFormState =
  | {
      ok?: boolean;
      message?: string;
      errors?: Partial<Record<keyof z.infer<typeof CategorySchema>, string[]>>;
    }
  | undefined;

function parseCategory(formData: FormData) {
  return CategorySchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") || formData.get("name") || "",
    description: formData.get("description") ?? "",
  });
}

function isUniqueSlugError(error: unknown) {
  return (error as { code?: string })?.code === "P2002";
}

function revalidateCategories() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/news", "layout");
}

export async function createCategory(
  _state: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireDashboardUser();
  const parsed = parseCategory(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    await prisma.categories.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueSlugError(error)) return { errors: { slug: ["Slug sudah dipakai."] } };
    console.error("createCategory:", error);
    return { message: "Gagal menyimpan kategori." };
  }

  revalidateCategories();
  return { ok: true };
}

export async function updateCategory(
  id: string,
  _state: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireDashboardUser();
  const parsed = parseCategory(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    await prisma.categories.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueSlugError(error)) return { errors: { slug: ["Slug sudah dipakai."] } };
    console.error("updateCategory:", error);
    return { message: "Gagal menyimpan kategori." };
  }

  revalidateCategories();
  return { ok: true };
}

/** Articles in this category become "Tanpa kategori" (onDelete: SetNull). */
export async function deleteCategory(id: string) {
  await requireDashboardUser();
  await prisma.categories.delete({ where: { id } }).catch(() => null);
  revalidateCategories();
}

/** Quick add from the article form; reuses an existing category with the same slug. */
export async function quickCreateCategory(
  name: string
): Promise<{ category?: { id: string; name: string }; error?: string }> {
  await requireDashboardUser();
  const parsed = CategorySchema.safeParse({ name, slug: name, description: "" });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const category = await prisma.categories.upsert({
    where: { slug: parsed.data.slug },
    update: {},
    create: parsed.data,
    select: { id: true, name: true },
  });

  revalidateCategories();
  return { category };
}
