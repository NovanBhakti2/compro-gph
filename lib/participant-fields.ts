import * as z from "zod";

// Shared by the sign-up and claim forms (and the dashboard)

// Latin letters incl. accents (what the certificate fonts can print)
const NAME = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .,'’-]*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const participantName = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(3, { error: "Nama minimal 3 karakter." })
      .max(80, { error: "Nama maksimal 80 karakter." })
      .regex(NAME, { error: "Nama hanya boleh huruf, spasi, titik, koma, apostrof, dan tanda hubung." }),
  );

export const emailField = z.string().trim().max(150).regex(EMAIL, { error: "Isi alamat email yang valid." });
