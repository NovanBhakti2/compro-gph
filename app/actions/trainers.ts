"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export type TrainerFormState =
  | {
      message?: string;
      errors?: Partial<Record<string, string[]>>;
    }
  | undefined;

const TrainerSchema = z.object({
  name: z.string().trim().min(3, { error: "Nama minimal 3 karakter." }).max(100),
  title: z.string().trim().min(2, { error: "Jabatan minimal 2 karakter." }).max(100),
  signature_url: z
    .string()
    .trim()
    .max(500)
    // The PDF library only embeds PNG and JPEG
    .refine((v) => !v || /\.(png|jpe?g)(\?.*)?$/i.test(v), {
      error: "Tanda tangan harus PNG (disarankan, latar transparan) atau JPG.",
    })
    .transform((v) => v || null),
});

function parseTrainer(formData: FormData) {
  return TrainerSchema.safeParse({
    name: formData.get("name") ?? "",
    title: formData.get("title") ?? "",
    signature_url: formData.get("signature_url") ?? "",
  });
}

function revalidateTrainers() {
  revalidatePath("/dashboard/trainers");
  // Certificates are rendered on demand; only the dashboard lists need refreshing
  revalidatePath("/dashboard/trainings", "layout");
}

export async function createTrainer(_state: TrainerFormState, formData: FormData): Promise<TrainerFormState> {
  await requireAdmin();
  const parsed = parseTrainer(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await prisma.trainers.create({ data: parsed.data });
  } catch (error) {
    console.error("createTrainer:", error);
    return { message: "Gagal menyimpan trainer." };
  }
  revalidateTrainers();
  redirect("/dashboard/trainers");
}

export async function updateTrainer(id: string, _state: TrainerFormState, formData: FormData): Promise<TrainerFormState> {
  await requireAdmin();
  const parsed = parseTrainer(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await prisma.trainers.update({ where: { id }, data: parsed.data });
  } catch (error) {
    console.error("updateTrainer:", error);
    return { message: "Gagal menyimpan trainer." };
  }
  revalidateTrainers();
  redirect("/dashboard/trainers");
}

export async function deleteTrainer(id: string) {
  await requireAdmin();
  // Trainings keep their certificates and fall back to the template's default trainer
  await prisma.trainers.delete({ where: { id } }).catch(() => null);
  revalidateTrainers();
}
