"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  claimStatus,
  contactKey,
  dateFromInput,
  emailCertificate,
  issueCertificate,
  newCode,
  newSlug,
  CERTIFICATE_INCLUDE,
  type Certificate,
  type CertificateWithTraining,
  type Training,
  type TrainingWithTrainer,
} from "@/lib/certificates";
import { isEmailEnabled } from "@/lib/email";
import { emailField, participantName } from "@/lib/participant-fields";

const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;
const TIME_INPUT = /^([01]\d|2[0-3]):[0-5]\d$/;
const contactField = emailField;

export type FormState =
  | {
      message?: string;
      errors?: Partial<Record<string, string[]>>;
    }
  | undefined;

// ---------- Trainings (dashboard) ----------

/** Dashboard list plus the public schedule (homepage, /register). */
function revalidateTrainings() {
  revalidatePath("/dashboard/trainings");
  revalidatePath("/[lang]", "layout");
}

const TrainingSchema = z
  .object({
    title: z.string().trim().min(3, { error: "Nama training minimal 3 karakter." }).max(200),
    starts_on: z.string().regex(DATE_INPUT, { error: "Pilih tanggal training." }),
    ends_on: z.string().refine((v) => !v || DATE_INPUT.test(v), { error: "Tanggal tidak valid." }),
    claim_until: z.string().refine((v) => !v || DATE_INPUT.test(v), { error: "Tanggal tidak valid." }),
    claim_time: z.string().regex(TIME_INPUT, { error: "Jam tidak valid." }),
    time_start: z.string().refine((v) => !v || TIME_INPUT.test(v), { error: "Jam tidak valid." }),
    time_end: z.string().refine((v) => !v || TIME_INPUT.test(v), { error: "Jam tidak valid." }),
    location: z.string().trim().max(200, { error: "Lokasi maksimal 200 karakter." }),
    is_open: z.boolean(),
    registration_open: z.boolean(),
    trainer_id: z.string().max(36),
  })
  .refine((v) => !v.ends_on || v.ends_on >= v.starts_on, {
    path: ["ends_on"],
    error: "Tanggal selesai harus sama atau setelah tanggal mulai.",
  })
  .refine((v) => !v.time_end || v.time_start, {
    path: ["time_start"],
    error: "Isi jam mulai.",
  })
  .refine((v) => !v.time_start || !v.time_end || v.time_end > v.time_start, {
    path: ["time_end"],
    error: "Jam selesai harus setelah jam mulai.",
  })
  .refine((v) => !v.claim_until || v.claim_until >= v.starts_on, {
    path: ["claim_until"],
    error: "Batas klaim harus setelah tanggal training dimulai.",
  });

function parseTraining(formData: FormData) {
  const parsed = TrainingSchema.safeParse({
    title: formData.get("title") ?? "",
    starts_on: formData.get("starts_on") ?? "",
    ends_on: formData.get("ends_on") ?? "",
    claim_until: formData.get("claim_until") ?? "",
    // Disabled (not submitted) while there's no date
    claim_time: formData.get("claim_time") || "23:59",
    time_start: formData.get("time_start") ?? "",
    time_end: formData.get("time_end") ?? "",
    location: formData.get("location") ?? "",
    is_open: formData.get("is_open") === "on",
    registration_open: formData.get("registration_open") === "on",
    trainer_id: formData.get("trainer_id") ?? "",
  });
  if (!parsed.success) return parsed;
  const v = parsed.data;
  return {
    success: true as const,
    data: {
      title: v.title,
      starts_on: dateFromInput(v.starts_on),
      ends_on: v.ends_on && v.ends_on !== v.starts_on ? dateFromInput(v.ends_on) : null,
      // Up to and including the chosen minute, in WIB
      claim_until: v.claim_until ? new Date(`${v.claim_until}T${v.claim_time}:59.999+07:00`) : null,
      time_start: v.time_start || null,
      time_end: v.time_end || null,
      location: v.location || null,
      is_open: v.is_open,
      registration_open: v.registration_open,
      trainer_id: v.trainer_id || null,
    },
  };
}

export async function createTraining(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseTraining(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  let training: Training;
  try {
    training = await prisma.trainings.create({ data: { ...parsed.data, slug: newSlug(parsed.data.title) } });
  } catch (error) {
    console.error("createTraining:", error);
    return { message: "Gagal menyimpan training." };
  }
  revalidateTrainings();
  redirect(`/dashboard/trainings/${training.id}`);
}

export async function updateTraining(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseTraining(formData);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    // The slug stays: the QR code may already be printed
    await prisma.trainings.update({ where: { id }, data: parsed.data });
  } catch (error) {
    console.error("updateTraining:", error);
    return { message: "Gagal menyimpan training." };
  }
  revalidateTrainings();
  redirect(`/dashboard/trainings/${id}`);
}

export async function toggleTrainingClaims(id: string) {
  await requireAdmin();
  const training = await prisma.trainings.findUnique({ where: { id }, select: { is_open: true } });
  if (!training) return;
  await prisma.trainings.update({ where: { id }, data: { is_open: !training.is_open } });
  revalidateTrainings();
  revalidatePath(`/dashboard/trainings/${id}`);
}

export async function deleteTraining(id: string) {
  await requireAdmin();
  // Certificates go with it (cascade); their verification links stop working
  await prisma.trainings.delete({ where: { id } }).catch(() => null);
  revalidateTrainings();
  redirect("/dashboard/trainings");
}

// ---------- Participants (dashboard) ----------

export async function addParticipant(trainingId: string, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = z
    .object({
      participant_name: participantName,
      contact: z.union([z.literal(""), contactField]),
      send_email: z.boolean(),
    })
    .safeParse({
      participant_name: formData.get("participant_name") ?? "",
      contact: (formData.get("contact") as string | null)?.trim() ?? "",
      send_email: formData.get("send_email") === "on",
    });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const training: TrainingWithTrainer | null = await prisma.trainings.findUnique({
    where: { id: trainingId },
    include: { trainer: true },
  });
  if (!training) return { message: "Training tidak ditemukan." };

  const { participant_name, contact, send_email } = parsed.data;
  // Without an email the admin vouches for the person; give it a unique key
  const key = contact ? contactKey(contact) : `manual:${newCode()}`;
  const existing = await prisma.certificates.findUnique({
    where: { training_id_contact_key: { training_id: trainingId, contact_key: key } },
  });
  if (existing)
    return { errors: { contact: [`Email ini sudah punya sertifikat atas nama ${existing.participant_name}.`] } };

  let cert: Certificate;
  try {
    cert = await issueCertificate(training, participant_name, contact || null, key);
  } catch (error) {
    console.error("addParticipant:", error);
    return { message: "Gagal menambah peserta." };
  }
  const emailed = contact && send_email ? await emailCertificate({ ...cert, training }) : false;
  revalidatePath(`/dashboard/trainings/${trainingId}`);
  return { message: emailed ? "ok-emailed" : "ok" };
}

export async function renameCertificate(id: string, name: string): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = participantName.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const cert = await prisma.certificates
    .update({ where: { id }, data: { participant_name: parsed.data } })
    .catch(() => null);
  if (!cert) return { error: "Sertifikat tidak ditemukan." };
  revalidatePath(`/dashboard/trainings/${cert.training_id}`);
  return {};
}

export async function resendCertificateEmail(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!isEmailEnabled()) return { error: "Pengiriman email belum diaktifkan (RESEND_API_KEY belum diisi)." };
  const cert: CertificateWithTraining | null = await prisma.certificates.findUnique({
    where: { id },
    include: CERTIFICATE_INCLUDE,
  });
  if (!cert?.contact) return { error: "Peserta ini tidak punya email." };
  return (await emailCertificate(cert)) ? {} : { error: "Email gagal dikirim. Coba lagi nanti." };
}

export async function deleteCertificate(id: string) {
  await requireAdmin();
  const cert = await prisma.certificates.delete({ where: { id } }).catch(() => null);
  if (cert) revalidatePath(`/dashboard/trainings/${cert.training_id}`);
}

// ---------- Public claim ----------

export type ClaimState =
  | {
      errors?: Partial<Record<"participant_name" | "contact", string[]>>;
      message?: string;
      certificate?: { code: string; number: string; name: string; existing: boolean; emailedTo?: string };
    }
  | undefined;

const ClaimSchema = z.object({ participant_name: participantName, contact: contactField });

export async function claimCertificate(slug: string, _state: ClaimState, formData: FormData): Promise<ClaimState> {
  const parsed = ClaimSchema.safeParse({
    participant_name: formData.get("participant_name") ?? "",
    contact: formData.get("contact") ?? "",
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const training: TrainingWithTrainer | null = await prisma.trainings.findUnique({
    where: { slug },
    include: { trainer: true },
  });
  if (!training || claimStatus(training) !== "OPEN") return { message: "closed" };

  const key = contactKey(parsed.data.contact);
  let cert: Certificate | null = await prisma.certificates.findUnique({
    where: { training_id_contact_key: { training_id: training.id, contact_key: key } },
  });
  const existing = Boolean(cert);
  let emailed = false;
  if (!cert) {
    // Certificates are only for people who signed up for this training
    const registration: { status: string } | null = await prisma.registrations.findUnique({
      where: { training_id_email_key: { training_id: training.id, email_key: key } },
      select: { status: true },
    });
    if (!registration) return { message: "not-registered" };
    // ...and whom an admin approved
    if (registration.status === "PENDING") return { message: "pending" };
    if (registration.status !== "APPROVED") return { message: "rejected" };
    try {
      cert = await issueCertificate(training, parsed.data.participant_name, parsed.data.contact, key);
    } catch (error) {
      console.error("claimCertificate:", error);
      return { message: "error" };
    }
    // A failed email never fails the claim: the download is on the page anyway.
    // Not resent for an existing claim, so the form can't be used to spam an inbox.
    emailed = await emailCertificate({ ...cert, training }).catch(() => false);
  }
  revalidatePath(`/dashboard/trainings/${training.id}`);
  return {
    certificate: {
      code: cert.code,
      number: cert.number,
      name: cert.participant_name,
      existing,
      emailedTo: emailed ? (cert.contact ?? undefined) : undefined,
    },
  };
}
