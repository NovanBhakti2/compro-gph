"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { endOfDayWib, startOfDayWib } from "@/lib/promos";

const URL_OR_PATH = /^(https?:\/\/|\/)\S+$/;
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Maksimal ${max} karakter.` })
    .transform((v) => v || null);

const PromoSchema = z
  .object({
    title: z.string().trim().min(2, { error: "Nama promo minimal 2 karakter." }).max(255),
    image_url: z
      .string()
      .trim()
      .min(1, { error: "Upload gambar flyer dulu." })
      .max(500)
      .regex(URL_OR_PATH, { error: "URL gambar tidak valid." }),
    image_url_id: z
      .string()
      .trim()
      .max(500)
      .refine((v) => !v || URL_OR_PATH.test(v), { error: "URL gambar tidak valid." })
      .transform((v) => v || null),
    cta_label: optional(100),
    cta_label_id: optional(100),
    cta_url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => !v || URL_OR_PATH.test(v), {
        error: "Isi dengan link lengkap (https://...) atau path (/news).",
      })
      .transform((v) => v || null),
    starts_at: z
      .string()
      .trim()
      .refine((v) => !v || DATE_INPUT.test(v), { error: "Tanggal tidak valid." }),
    ends_at: z
      .string()
      .trim()
      .refine((v) => !v || DATE_INPUT.test(v), { error: "Tanggal tidak valid." }),
    show_on: z.enum(["HOME", "ALL"]),
    show_popup: z.boolean(),
    show_in_news: z.boolean(),
    is_active: z.boolean(),
    training_id: z
      .string()
      .max(36)
      .transform((v) => v || null),
  })
  .refine((v) => v.show_popup || v.show_in_news, {
    path: ["placement"],
    error: "Pilih minimal satu tempat tampil.",
  })
  .refine((v) => !v.starts_at || !v.ends_at || v.starts_at <= v.ends_at, {
    path: ["ends_at"],
    error: "Tanggal selesai harus sama atau setelah tanggal mulai.",
  })
  .refine((v) => v.training_id || !v.cta_label || v.cta_url, {
    path: ["cta_url"],
    error: "Isi link tujuan untuk tombol.",
  });

export type PromoFormState =
  | {
      message?: string;
      errors?: Partial<Record<string, string[]>>;
    }
  | undefined;

function parsePromo(formData: FormData) {
  const parsed = PromoSchema.safeParse({
    title: formData.get("title") ?? "",
    image_url: formData.get("image_url") ?? "",
    image_url_id: formData.get("image_url_id") ?? "",
    cta_label: formData.get("cta_label") ?? "",
    cta_label_id: formData.get("cta_label_id") ?? "",
    cta_url: formData.get("cta_url") ?? "",
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? "",
    show_on: formData.get("show_on") ?? "HOME",
    show_popup: formData.get("show_popup") === "on",
    show_in_news: formData.get("show_in_news") === "on",
    is_active: formData.get("is_active") === "on",
    training_id: formData.get("training_id") ?? "",
  });
  if (!parsed.success) return parsed;
  const { starts_at, ends_at, ...rest } = parsed.data;
  return {
    success: true as const,
    data: {
      ...rest,
      // A linked training sets the link itself
      cta_url: rest.training_id ? null : rest.cta_url,
      // Whole days in WIB: from 00:00 on the start date to 23:59 on the end date
      starts_at: starts_at ? startOfDayWib(starts_at) : null,
      ends_at: ends_at ? endOfDayWib(ends_at) : null,
    },
  };
}

function revalidatePromos() {
  // The popup is in the public root layout and the section in /news, both languages
  revalidatePath("/[lang]", "layout");
  revalidatePath("/dashboard/promos");
}

export async function createPromo(_state: PromoFormState, formData: FormData): Promise<PromoFormState> {
  await requireAdmin();
  const parsed = parsePromo(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    await prisma.promos.create({ data: parsed.data });
  } catch (error) {
    console.error("createPromo:", error);
    return { message: "Gagal menyimpan promo." };
  }
  revalidatePromos();
  redirect("/dashboard/promos");
}

export async function updatePromo(
  id: string,
  _state: PromoFormState,
  formData: FormData
): Promise<PromoFormState> {
  await requireAdmin();
  const parsed = parsePromo(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    await prisma.promos.update({ where: { id }, data: parsed.data });
  } catch (error) {
    console.error("updatePromo:", error);
    return { message: "Gagal menyimpan promo." };
  }
  revalidatePromos();
  redirect("/dashboard/promos");
}

/** Turn a promo on/off from the list without opening the form. */
export async function togglePromo(id: string) {
  await requireAdmin();
  const promo = await prisma.promos.findUnique({ where: { id }, select: { is_active: true } });
  if (!promo) return;
  await prisma.promos.update({ where: { id }, data: { is_active: !promo.is_active } });
  revalidatePromos();
}

export async function deletePromo(id: string) {
  await requireAdmin();
  await prisma.promos.delete({ where: { id } }).catch(() => null);
  revalidatePromos();
}
