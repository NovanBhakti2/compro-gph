"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

const UserSchema = z.object({
  name: z.string().trim().min(2, { error: "Nama minimal 2 karakter." }).max(255),
  email: z.email({ error: "Email tidak valid." }).trim().toLowerCase().max(255),
  role: z.enum(["ADMIN", "EDITOR"], { error: "Pilih role." }),
  password: z
    .string()
    .min(8, { error: "Password minimal 8 karakter." })
    .max(72, { error: "Password maksimal 72 karakter." }),
});

export type UserFormState =
  | {
      ok?: boolean;
      message?: string;
      errors?: Partial<Record<keyof z.infer<typeof UserSchema>, string[]>>;
    }
  | undefined;

export async function createUser(
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const parsed = UserSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    role: formData.get("role") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { password, ...data } = parsed.data;
  try {
    await prisma.users.create({
      data: { ...data, password: await bcrypt.hash(password, 10) },
    });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      return { errors: { email: ["Email ini sudah terdaftar."] } };
    }
    console.error("createUser:", error);
    return { message: "Gagal menambah pengguna." };
  }

  revalidatePath("/dashboard/account");
  return { ok: true, message: `${data.name} berhasil ditambahkan.` };
}

/**
 * news.author_id cascades on delete, so the user's articles are first handed
 * over to the admin doing the deletion; deleting a user never deletes articles.
 */
export async function deleteUser(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (id === admin.id) return { error: "Anda tidak bisa menghapus akun sendiri." };

  const target = await prisma.users.findUnique({ where: { id }, select: { role: true } });
  if (!target) return {};

  if (target.role === "ADMIN") {
    const admins = await prisma.users.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return { error: "Minimal harus ada satu admin." };
  }

  await prisma.$transaction([
    prisma.news.updateMany({ where: { author_id: id }, data: { author_id: admin.id } }),
    prisma.users.delete({ where: { id } }),
  ]);

  revalidatePath("/dashboard", "layout");
  return {};
}
