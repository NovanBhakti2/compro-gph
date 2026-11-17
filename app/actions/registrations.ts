"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/dal";
import { contactKey, formatTrainingDate, formatTrainingTime, type Training } from "@/lib/certificates";
import { registrationEmail, sendEmail } from "@/lib/email";
import { emailField, participantName } from "@/lib/participant-fields";
import { isRegistrationOpen, normalizePhone } from "@/lib/registrations";

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

  const when = (locale: string) =>
    [formatTrainingDate(training.starts_on, training.ends_on, locale), formatTrainingTime(training)]
      .filter(Boolean)
      .join(" · ");
  const date = when(lang === "id" ? "id-ID" : "en-GB");
  const location = training.location;
  const key = contactKey(email);
  const existing = await prisma.registrations.findUnique({
    where: { training_id_email_key: { training_id: training.id, email_key: key } },
  });
  // Signing up twice is harmless: confirm without changing or re-emailing
  if (existing)
    return { registered: { title: training.title, date, location, email: existing.email, existing: true, emailed: false } };

  try {
    await prisma.registrations.create({ data: { training_id: training.id, name, email, email_key: key, phone } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { registered: { title: training.title, date, location, email, existing: true, emailed: false } };
    }
    console.error("registerForTraining:", error);
    return { message: "error" };
  }

  // A failed email never fails the sign-up
  const { sent } = await sendEmail({
    to: email,
    ...registrationEmail({
      name,
      trainingTitle: training.title,
      date: when("id-ID"),
      location,
    }),
  }).catch(() => ({ sent: false }));

  revalidatePath(`/dashboard/trainings/${training.id}`);
  return { registered: { title: training.title, date, location, email, existing: false, emailed: sent } };
}

export async function deleteRegistration(id: string) {
  await requireDashboardUser();
  const registration = await prisma.registrations.delete({ where: { id } }).catch(() => null);
  if (registration) revalidatePath(`/dashboard/trainings/${registration.training_id}`);
}
