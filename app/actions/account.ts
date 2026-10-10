"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";

const PasswordSchema = z
  .object({
    current: z.string().min(1, { error: "Password lama wajib diisi." }),
    next: z
      .string()
      .min(8, { error: "Password baru minimal 8 karakter." })
      .max(72, { error: "Password baru maksimal 72 karakter." }),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, {
    path: ["confirm"],
    error: "Konfirmasi tidak sama dengan password baru.",
  })
  .refine((v) => v.next !== v.current, {
    path: ["next"],
    error: "Password baru harus berbeda dari password lama.",
  });

export type PasswordFormState =
  | {
      ok?: boolean;
      message?: string;
      errors?: Partial<Record<"current" | "next" | "confirm", string[]>>;
    }
  | undefined;

export async function changePassword(
  _state: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const user = await requireDashboardUser();

  const parsed = PasswordSchema.safeParse({
    current: formData.get("current") ?? "",
    next: formData.get("next") ?? "",
    confirm: formData.get("confirm") ?? "",
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const record = await prisma.users.findUnique({
    where: { id: user.id },
    select: { password: true },
  });
  const valid = record ? await bcrypt.compare(parsed.data.current, record.password) : false;
  if (!valid) {
    return { errors: { current: ["Password lama salah."] } };
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(parsed.data.next, 10) },
  });

  return { ok: true, message: "Password berhasil diganti." };
}
