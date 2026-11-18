"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { contactKey, type Training } from "@/lib/certificates";
import { approvalEmail, isEmailEnabled, registrationEmail, sendEmail } from "@/lib/email";
import { emailField, participantName } from "@/lib/participant-fields";
import {
  isRegistrationOpen,
  normalizePhone,
  trainingWhen,
  type Registration,
  type RegistrationStatus,
} from "@/lib/registrations";
import { extractRegistrants } from "@/lib/registrations-import";
import { readSpreadsheet } from "@/lib/spreadsheet-read";

export type RegisterState =
  | {
      errors?: Partial<Record<"training" | "name" | "email" | "phone", string[]>>;
      /** "closed" | "error" */
      message?: string;
      registered?: {
        title: string;
        /** Date, plus the time when set */
        date: string;
        location: string | null;
        email: string;
        existing: boolean;
        emailed: boolean;
        status: RegistrationStatus;
      };
    }
  | undefined;

const RegisterSchema = z.object({
  training: z.string().min(1, { error: "Pilih pelatihan." }).max(80),
  name: participantName,
  email: emailField,
  phone: z
    .string()
    .trim()
    .max(30)
    .transform((v, ctx) => {
      const phone = normalizePhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Isi nomor HP yang valid, mis. 0812 3456 7890." });
        return z.NEVER;
      }
      return phone;
    }),
});

export async function registerForTraining(
  lang: string,
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Honeypot: hidden from people, filled in by form-spamming bots
  if (formData.get("website")) return { message: "error" };

  const parsed = RegisterSchema.safeParse({
    training: formData.get("training") ?? "",
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  const { name, email, phone } = parsed.data;

  const training: Training | null = await prisma.trainings.findUnique({ where: { slug: parsed.data.training } });
  if (!training || !isRegistrationOpen(training)) return { message: "closed" };

  const date = trainingWhen(training, lang === "id" ? "id-ID" : "en-GB");
  const location = training.location;
  const key = contactKey(email);
  const existing: Registration | null = await prisma.registrations.findUnique({
    where: { training_id_email_key: { training_id: training.id, email_key: key } },
  });
  // Signing up twice is harmless: confirm without changing or re-emailing
  if (existing)
    return {
      registered: {
        title: training.title,
        date,
        location,
        email: existing.email,
        existing: true,
        emailed: false,
        status: existing.status as RegistrationStatus,
      },
    };

  try {
    await prisma.registrations.create({ data: { training_id: training.id, name, email, email_key: key, phone } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return {
        registered: { title: training.title, date, location, email, existing: true, emailed: false, status: "PENDING" },
      };
    }
    console.error("registerForTraining:", error);
    return { message: "error" };
  }

  // A failed email never fails the sign-up
  const { sent } = await sendEmail({
    to: email,
    ...registrationEmail({ name, trainingTitle: training.title, date: trainingWhen(training, "id-ID"), location }),
  }).catch(() => ({ sent: false }));

  revalidatePath(`/dashboard/trainings/${training.id}`);
  revalidatePath("/dashboard");
  return {
    registered: { title: training.title, date, location, email, existing: false, emailed: sent, status: "PENDING" },
  };
}

export async function deleteRegistration(id: string) {
  await requireAdmin();
  const registration = await prisma.registrations.delete({ where: { id } }).catch(() => null);
  if (registration) revalidatePath(`/dashboard/trainings/${registration.training_id}`);
}

// ---------- Approval (dashboard) ----------

/** Emails the approval; stamps notified_at when it went out. */
async function sendApproval(registration: Registration, training: Training) {
  const { sent } = await sendEmail({
    to: registration.email,
    ...approvalEmail({
      name: registration.name,
      trainingTitle: training.title,
      date: trainingWhen(training, "id-ID"),
      location: training.location,
    }),
  }).catch(() => ({ sent: false }));
  if (sent) await prisma.registrations.update({ where: { id: registration.id }, data: { notified_at: new Date() } });
  return sent;
}

/**
 * Approves, rejects or puts back on hold one sign-up. Approving emails the
 * person (once: a later re-approval doesn't send it again).
 */
export async function decideRegistration(
  id: string,
  status: RegistrationStatus,
): Promise<{ error?: string; emailed?: boolean }> {
  await requireAdmin();
  const registration: (Registration & { training: Training }) | null = await prisma.registrations.findUnique({
    where: { id },
    include: { training: true },
  });
  if (!registration) return { error: "Pendaftar tidak ditemukan." };
  const updated: Registration = await prisma.registrations.update({
    where: { id },
    data: { status, decided_at: status === "PENDING" ? null : new Date() },
  });
  const emailed =
    status === "APPROVED" && !registration.notified_at && isEmailEnabled()
      ? await sendApproval(updated, registration.training)
      : false;
  revalidatePath(`/dashboard/trainings/${registration.training_id}`);
  revalidatePath("/dashboard");
  return { emailed };
}

/** Approves every waiting sign-up of a training and emails each of them. */
export async function approveAllRegistrations(trainingId: string): Promise<{ approved: number; emailed: number }> {
  await requireAdmin();
  const training: Training | null = await prisma.trainings.findUnique({ where: { id: trainingId } });
  if (!training) return { approved: 0, emailed: 0 };
  const pending: Registration[] = await prisma.registrations.findMany({
    where: { training_id: trainingId, status: "PENDING" },
  });
  await prisma.registrations.updateMany({
    where: { id: { in: pending.map((r) => r.id) } },
    data: { status: "APPROVED", decided_at: new Date() },
  });
  let emailed = 0;
  if (isEmailEnabled()) {
    for (const r of pending) if (!r.notified_at && (await sendApproval(r, training))) emailed++;
  }
  revalidatePath(`/dashboard/trainings/${trainingId}`);
  revalidatePath("/dashboard");
  return { approved: pending.length, emailed };
}

/** Sends the approval email again (e.g. it bounced, or email was set up later). */
export async function resendApprovalEmail(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!isEmailEnabled()) return { error: "Pengiriman email belum aktif (RESEND_API_KEY belum diisi)." };
  const registration: (Registration & { training: Training }) | null = await prisma.registrations.findUnique({
    where: { id },
    include: { training: true },
  });
  if (!registration || registration.status !== "APPROVED") return { error: "Pendaftar belum disetujui." };
  const sent = await sendApproval(registration, registration.training);
  revalidatePath(`/dashboard/trainings/${registration.training_id}`);
  return sent ? {} : { error: "Email gagal dikirim. Coba lagi nanti." };
}

// ---------- Import from a spreadsheet (dashboard) ----------

export type ImportState =
  | {
      error?: string;
      result?: {
        added: number;
        /** Already registered (or listed twice in the file) */
        skipped: number;
        invalid: { line: number; reason: string }[];
        invalidCount: number;
      };
    }
  | undefined;

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_ROWS = 2000;

/**
 * Adds the people in an Excel/CSV file as registrants, so they can claim a
 * certificate: those who signed up on paper, by WhatsApp, a Google Form…
 * Existing emails are left as they are; invalid rows are reported, not added.
 */
export async function importRegistrations(
  trainingId: string,
  _state: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file Excel (.xlsx) atau CSV dulu." };
  if (file.size > MAX_FILE_BYTES) return { error: "File terlalu besar (maksimal 1 MB)." };

  const training: Training | null = await prisma.trainings.findUnique({ where: { id: trainingId } });
  if (!training) return { error: "Training tidak ditemukan." };
  if (training.registrations_purged_at)
    return { error: "Data pendaftar training ini sudah dihapus otomatis; import tidak bisa lagi." };

  let table;
  try {
    table = extractRegistrants(readSpreadsheet(Buffer.from(await file.arrayBuffer()), file.name));
  } catch {
    return { error: "File tidak bisa dibaca. Simpan sebagai .xlsx atau .csv lalu coba lagi." };
  }
  if (!table) {
    return {
      error: "Kolom tidak ditemukan. Pastikan ada baris judul dengan kolom Nama dan Email (pakai template kalau ragu).",
    };
  }
  if (table.rows.length === 0) return { error: "Tidak ada data peserta di file ini." };
  if (table.rows.length > MAX_ROWS) return { error: `Maksimal ${MAX_ROWS} baris per import.` };

  const invalid: { line: number; reason: string }[] = [];
  const valid = new Map<string, { name: string; email: string; phone: string }>();
  let duplicatesInFile = 0;
  for (const row of table.rows) {
    const name = participantName.safeParse(row.name);
    const email = emailField.safeParse(row.email);
    // Phone is optional here: offline lists often don't have one
    const phone = row.phone ? normalizePhone(row.phone) : "";
    if (!name.success)
      invalid.push({ line: row.line, reason: row.name ? `Nama "${row.name}" tidak valid` : "Nama kosong" });
    else if (!email.success)
      invalid.push({ line: row.line, reason: row.email ? `Email "${row.email}" tidak valid` : "Email kosong" });
    else if (phone === null) invalid.push({ line: row.line, reason: `No. HP "${row.phone}" tidak valid` });
    else {
      const key = contactKey(email.data);
      if (valid.has(key)) duplicatesInFile++;
      else valid.set(key, { name: name.data, email: email.data, phone });
    }
  }

  let added = 0;
  if (valid.size) {
    const result = await prisma.registrations.createMany({
      data: [...valid].map(([key, r]) => ({
        training_id: trainingId,
        name: r.name,
        email: r.email,
        email_key: key,
        phone: r.phone,
        // The admin put them on the list: no approval step, no email
        status: "APPROVED",
        decided_at: new Date(),
      })),
      // Someone already registered keeps their own details
      skipDuplicates: true,
    });
    added = result.count;
  }
  revalidatePath(`/dashboard/trainings/${trainingId}`);
  revalidatePath("/dashboard");
  return {
    result: {
      added,
      skipped: valid.size - added + duplicatesInFile,
      invalid: invalid.slice(0, 20),
      invalidCount: invalid.length,
    },
  };
}
