"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.email({ error: "Email tidak valid." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Password wajib diisi." }),
  from: z.string().optional(),
});

export type LoginState = { message?: string; email?: string } | undefined;

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    from: formData.get("from") || undefined,
  });

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message,
      email: String(formData.get("email") ?? ""),
    };
  }

  const { email, password, from } = parsed.data;
  const user = await prisma.users.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !valid) {
    return { message: "Email atau password salah.", email };
  }

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    return { message: "Akun ini tidak punya akses ke dashboard.", email };
  }

  try {
    await createSession({ userId: user.id, role: user.role });
  } catch (error) {
    console.error("createSession:", error);
    return { message: "Login belum bisa dipakai: konfigurasi server belum lengkap.", email };
  }

  // Only allow internal dashboard redirects
  redirect(from?.startsWith("/dashboard") ? from : "/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
