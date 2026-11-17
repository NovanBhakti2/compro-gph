import { randomBytes } from "crypto";
import type { certificates, trainers, trainings } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";
import { renderCertificate } from "@/lib/certificate/pdf";
import { certificateEmail, sendEmail } from "@/lib/email";
import { readImage } from "@/lib/uploads";

export type Training = trainings;
export type Trainer = trainers;
export type Certificate = certificates;
export type TrainingWithTrainer = trainings & { trainer: trainers | null };
export type CertificateWithTraining = certificates & { training: TrainingWithTrainer };

/** Prisma include for everything a certificate PDF needs. */
export const CERTIFICATE_INCLUDE = { training: { include: { trainer: true } } } as const;

// Training days are calendar dates (stored as UTC midnight)
export const dateFromInput = (value: string) => new Date(`${value}T00:00:00Z`);
export const dateToInput = (value: Date | null | undefined) => (value ? value.toISOString().slice(0, 10) : "");

/** "8 November 2026", "8–10 November 2026", "30 November – 2 December 2026"… */
export function formatTrainingDate(start: Date, end?: Date | null, locale = "en-GB") {
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" }).format(d);
  const full = { day: "numeric", month: "long", year: "numeric" } as const;
  if (!end || end.getTime() === start.getTime()) return fmt(start, full);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  if (sameYear && start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}–${fmt(end, full)}`;
  }
  return `${fmt(start, sameYear ? { day: "numeric", month: "long" } : full)} – ${fmt(end, full)}`;
}

/** "09:00–16:00 WIB", "09:00 WIB", or null when no time is set. */
export function formatTrainingTime(training: Pick<Training, "time_start" | "time_end">) {
  if (!training.time_start) return null;
  return `${training.time_start}${training.time_end ? `–${training.time_end}` : ""} WIB`;
}

/** "HH:MM" of a moment in WIB, for the time input. */
export const timeToInput = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(value);

/** "18 November 2026, 17:00 WIB" */
export const formatClaimUntil = (value: Date, locale = "id-ID") =>
  `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(value)}, ${timeToInput(value)} WIB`;

export type ClaimStatus = "OPEN" | "CLOSED" | "EXPIRED";

export function claimStatus(
  training: Pick<Training, "is_open" | "claim_until" | "registrations_purged_at">,
  now = new Date()
): ClaimStatus {
  if (!training.is_open) return "CLOSED";
  if (training.claim_until && training.claim_until < now) return "EXPIRED";
  // Only registered emails can claim; once the sign-ups are deleted nobody can
  if (training.registrations_purged_at) return "EXPIRED";
  return "OPEN";
}

/** One claim per email per training, whatever the capitalisation. */
export const contactKey = (email: string) => email.trim().toLowerCase();

export const formatNumber = (seq: number, year: number) => `${String(seq).padStart(3, "0")}/GPH/TRN/${year}`;

// No 0/O/1/I/L, so a code read off paper can be typed back
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function newCode() {
  return Array.from(randomBytes(8), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** URL-safe slug for the claim link, with a random suffix so it can't be guessed. */
export function newSlug(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .replace(/-$/, "");
  return `${base || "training"}-${newCode().slice(0, 5).toLowerCase()}`;
}

export const claimUrl = (slug: string) => `${SITE.url}/claim/${slug}`;
export const verifyUrl = (code: string) => `${SITE.url}/verify/${code}`;

/**
 * Creates the certificate with the next number of the training's year. The
 * number is unique in the database; on a clash with a parallel claim it
 * simply takes the next one.
 */
export async function issueCertificate(training: Training, participantName: string, contact: string | null, key: string) {
  const year = training.starts_on.getUTCFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await prisma.certificates.aggregate({ where: { year }, _max: { seq: true } });
    const seq = (last._max.seq ?? 0) + 1;
    try {
      return (await prisma.certificates.create({
        data: {
          training_id: training.id,
          participant_name: participantName,
          contact,
          contact_key: key,
          year,
          seq,
          number: formatNumber(seq, year),
          code: newCode(),
        },
      })) as Certificate;
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
      // The same person claiming twice goes back to the caller; a number taken
      // by a parallel claim is retried
      const duplicate = await prisma.certificates.findUnique({
        where: { training_id_contact_key: { training_id: training.id, contact_key: key } },
      });
      if (duplicate) return duplicate as Certificate;
    }
  }
  throw new Error("Could not allocate a certificate number");
}

const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

/** Bytes of an image uploaded from the dashboard (local uploads/ or Vercel Blob). */
export async function readUploadedImage(url: string | null | undefined): Promise<Uint8Array | null> {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return (await readImage(url.slice("/uploads/".length)))?.data ?? null;
  try {
    // Only our own blob store: the URL is typed by an admin, never fetch arbitrary hosts
    if (!BLOB_HOST.test(new URL(url).hostname)) return null;
    const response = await fetch(url);
    return response.ok ? new Uint8Array(await response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export async function trainerForPdf(trainer: Trainer | null) {
  if (!trainer) return undefined;
  return { name: trainer.name, title: trainer.title, signature: await readUploadedImage(trainer.signature_url) };
}

export async function certificatePdf(cert: CertificateWithTraining) {
  return renderCertificate({
    participantName: cert.participant_name,
    trainingTitle: cert.training.title,
    date: formatTrainingDate(cert.training.starts_on, cert.training.ends_on),
    number: cert.number,
    verifyUrl: verifyUrl(cert.code),
    trainer: await trainerForPdf(cert.training.trainer),
  });
}

/** Emails the certificate PDF to the participant; false when not sent (no email, or email not set up). */
export async function emailCertificate(cert: CertificateWithTraining) {
  if (!cert.contact?.includes("@")) return false;
  const message = certificateEmail({
    name: cert.participant_name,
    trainingTitle: cert.training.title,
    date: formatTrainingDate(cert.training.starts_on, cert.training.ends_on, "id-ID"),
    number: cert.number,
    downloadUrl: `${SITE.url}/api/certificates/${cert.code}`,
    verifyUrl: verifyUrl(cert.code),
  });
  const pdf = await certificatePdf(cert);
  const result = await sendEmail({
    to: cert.contact,
    ...message,
    attachments: [{ filename: certificateFileName(cert), content: pdf }],
  });
  return result.sent;
}

/** "Certificate-001-GPH-TRN-2026-Siti-Nurhaliza.pdf" */
export function certificateFileName(cert: Pick<Certificate, "number" | "participant_name">) {
  const name = cert.participant_name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `Certificate-${cert.number.replace(/\//g, "-")}-${name}.pdf`;
}
