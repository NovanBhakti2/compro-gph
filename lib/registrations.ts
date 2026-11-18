import type { Prisma, registrations } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";
import {
  dateFromInput,
  dateToInput,
  formatTrainingDate,
  formatTrainingTime,
  type Training,
  type TrainingWithTrainer,
} from "@/lib/certificates";

export type Registration = registrations;

/** Website sign-ups start PENDING; only APPROVED people can claim a certificate. */
export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

/** "17–18 November 2026 · 09:00–16:00 WIB" (the time only when set). */
export const trainingWhen = (training: Training, locale: string) =>
  [formatTrainingDate(training.starts_on, training.ends_on, locale), formatTrainingTime(training)]
    .filter(Boolean)
    .join(" · ");

/** Sign-ups are kept this long after the claim deadline, then deleted. */
export const RETENTION_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

/** End of the training's last day, in WIB. */
export function trainingEnd(training: Pick<Training, "starts_on" | "ends_on">) {
  return new Date(`${dateToInput(training.ends_on ?? training.starts_on)}T23:59:59.999+07:00`);
}

/** Today's calendar date in WIB, as stored in starts_on / ends_on. */
export function todayWib(now = new Date()) {
  return dateFromInput(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now));
}

type RegistrationFields = Pick<Training, "registration_open" | "registrations_purged_at" | "starts_on" | "ends_on">;

/** Sign-ups run until the end of the training's last day. */
export function isRegistrationOpen(training: RegistrationFields, now = new Date()) {
  return training.registration_open && !training.registrations_purged_at && trainingEnd(training) >= now;
}

/** Prisma filter matching isRegistrationOpen. */
export function openRegistrationWhere(now = new Date()) {
  const today = todayWib(now);
  return {
    registration_open: true,
    registrations_purged_at: null,
    OR: [{ ends_on: { gte: today } }, { ends_on: null, starts_on: { gte: today } }],
  };
}

/** Trainings open for sign-up, soonest first; [] when the database is unreachable (public pages keep rendering). */
export async function getOpenTrainings(take?: number): Promise<TrainingWithTrainer[]> {
  try {
    return await prisma.trainings.findMany({
      where: openRegistrationWhere(),
      orderBy: { starts_on: "asc" },
      include: { trainer: true },
      take,
    });
  } catch (error) {
    console.error("getOpenTrainings:", error);
    return [];
  }
}

/** When the sign-ups of a training get deleted. */
export function purgeDate(training: Pick<Training, "claim_until" | "starts_on" | "ends_on">) {
  return new Date((training.claim_until ?? trainingEnd(training)).getTime() + RETENTION_DAYS * DAY);
}

/**
 * Deletes the sign-ups (name, email, phone) of trainings past their purge
 * date. Certificates stay, so verification keeps working. Runs from the daily
 * cron and whenever the dashboard lists trainings.
 */
export async function purgeExpiredRegistrations(now = new Date()) {
  const candidates: Training[] = await prisma.trainings.findMany({ where: { registrations_purged_at: null } });
  let purged = 0;
  for (const training of candidates) {
    if (purgeDate(training) > now) continue;
    purged += await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { count } = await tx.registrations.deleteMany({ where: { training_id: training.id } });
      await tx.trainings.update({
        where: { id: training.id },
        data: { registrations_purged_at: now, registrations_purged_count: count },
      });
      return count;
    });
  }
  return purged;
}

/**
 * "0812-3456 7890", "62812…", "+62 812…" → "+6281234567890".
 * Returns null when it doesn't look like a phone number.
 */
export function normalizePhone(raw: string) {
  let phone = raw.replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  else if (phone.startsWith("0")) phone = `+62${phone.slice(1)}`;
  else if (phone.startsWith("62")) phone = `+${phone}`;
  else if (phone.startsWith("8")) phone = `+62${phone}`;
  return /^\+[1-9]\d{8,14}$/.test(phone) ? phone : null;
}

/** "+6281234567890" → "0812-3456-7890" for Indonesian numbers. */
export function formatPhone(phone: string) {
  if (!phone.startsWith("+62")) return phone;
  const local = `0${phone.slice(3)}`;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}

export const whatsappUrl = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

export const registerUrl = (slug?: string) => `${SITE.url}/register${slug ? `?training=${slug}` : ""}`;
