// Transactional email through Resend's HTTP API (no SDK needed).
// Without RESEND_API_KEY nothing is sent and callers carry on: participants
// can always download the certificate on the page itself.

const API_URL = "https://api.resend.com/emails";

export const isEmailEnabled = () => Boolean(process.env.RESEND_API_KEY);

type Attachment = { filename: string; content: Uint8Array };

export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
}): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "RESEND_API_KEY is not set" };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Must be on the domain verified in Resend
        from: process.env.EMAIL_FROM ?? "PT. Gama Putra Harmoni <sertifikat@gamaputraharmoni.com>",
        to: [message.to],
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: message.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content).toString("base64"),
        })),
      }),
    });
    if (!response.ok) {
      const error = `Resend ${response.status}: ${(await response.text()).slice(0, 300)}`;
      console.error("sendEmail:", error);
      return { sent: false, error };
    }
    return { sent: true };
  } catch (error) {
    console.error("sendEmail:", error);
    return { sent: false, error: String(error) };
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Bilingual (ID first, EN below): participants are mostly Indonesian, the certificate is English. */
export function certificateEmail(data: {
  name: string;
  trainingTitle: string;
  date: string;
  number: string;
  downloadUrl: string;
  verifyUrl: string;
}) {
  const name = escapeHtml(data.name);
  const title = escapeHtml(data.trainingTitle);
  const subject = `Sertifikat ${data.trainingTitle} — ${data.number}`;
  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#1e293b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#0f1932;padding:24px 28px">
    <p style="margin:0;color:#C7974C;font-size:12px;font-weight:bold;letter-spacing:1.5px">PT. GAMA PUTRA HARMONI</p>
    <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:bold">Certificate of Training</p>
  </td></tr>
  <tr><td style="padding:28px">
    <p style="margin:0 0 14px;font-size:15px">Halo <b>${name}</b>,</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6">Terima kasih telah mengikuti pelatihan <b>${title}</b> (${escapeHtml(data.date)}). Sertifikat Anda terlampir di email ini.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fbf8f2;border:1px solid #ecdcbf;border-radius:12px">
      <tr><td style="padding:14px 18px;font-size:13px;color:#64748b">No. Sertifikat<br><b style="font-size:15px;color:#0f1932">${escapeHtml(data.number)}</b></td></tr>
    </table>
    <p style="margin:22px 0">
      <a href="${data.downloadUrl}" style="display:inline-block;background:#C7974C;color:#0f1932;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:10px">Unduh sertifikat</a>
    </p>
    <p style="margin:0 0 22px;font-size:12px;line-height:1.6;color:#64748b">Keaslian sertifikat bisa dicek lewat QR di sertifikat atau di <a href="${data.verifyUrl}" style="color:#9c7d42">${data.verifyUrl}</a>.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 18px">
    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">Hello ${name}, thank you for attending <b>${title}</b>. Your certificate is attached to this email.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
  const text = [
    `Halo ${data.name},`,
    ``,
    `Terima kasih telah mengikuti pelatihan ${data.trainingTitle} (${data.date}). Sertifikat Anda terlampir.`,
    `No. Sertifikat: ${data.number}`,
    `Unduh: ${data.downloadUrl}`,
    `Verifikasi: ${data.verifyUrl}`,
    ``,
    `PT. Gama Putra Harmoni`,
  ].join("\n");
  return { subject, html, text };
}

type TrainingMail = {
  name: string;
  trainingTitle: string;
  /** Date, plus the time when set */
  date: string;
  location?: string | null;
};

/** Shared frame of the sign-up emails: header, greeting, training box, then the given paragraphs. */
function trainingMailHtml(data: TrainingMail, heading: string, idText: string, after: string, enText: string) {
  const name = escapeHtml(data.name);
  const title = escapeHtml(data.trainingTitle);
  const location = data.location
    ? `<br><span style="font-size:13px;color:#64748b">${escapeHtml(data.location)}</span>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#1e293b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
  <tr><td style="background:#0f1932;padding:24px 28px">
    <p style="margin:0;color:#C7974C;font-size:12px;font-weight:bold;letter-spacing:1.5px">PT. GAMA PUTRA HARMONI</p>
    <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:bold">${escapeHtml(heading)}</p>
  </td></tr>
  <tr><td style="padding:28px">
    <p style="margin:0 0 14px;font-size:15px">Halo <b>${name}</b>,</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6">${idText}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fbf8f2;border:1px solid #ecdcbf;border-radius:12px">
      <tr><td style="padding:14px 18px;font-size:15px;color:#0f1932"><b>${title}</b><br><span style="font-size:13px;color:#64748b">${escapeHtml(data.date)}</span>${location}</td></tr>
    </table>
    <p style="margin:18px 0 22px;font-size:13px;line-height:1.6;color:#475569">${after}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 18px">
    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">Hello ${name}, ${enText}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const trainingMailText = (data: TrainingMail, lines: string[]) =>
  [
    `Halo ${data.name},`,
    ``,
    ...lines,
    ``,
    `${data.trainingTitle}`,
    data.date,
    ...(data.location ? [`Lokasi: ${data.location}`] : []),
    ``,
    `PT. Gama Putra Harmoni`,
  ].join("\n");

/** Sent right after signing up on the website: received, waiting for approval. */
export function registrationEmail(data: TrainingMail) {
  const title = escapeHtml(data.trainingTitle);
  return {
    subject: `Pendaftaran diterima: ${data.trainingTitle}`,
    html: trainingMailHtml(
      data,
      "Pendaftaran diterima",
      "Terima kasih, pendaftaran Anda untuk pelatihan berikut sudah kami terima dan <b>sedang menunggu persetujuan</b>:",
      "Kami akan mengirim email lagi setelah pendaftaran Anda disetujui.",
      `your registration for <b>${title}</b> has been received and is awaiting approval. We will email you again once it is approved.`,
    ),
    text: trainingMailText(data, [
      `Pendaftaran Anda sudah kami terima dan sedang menunggu persetujuan.`,
      `Kami akan mengirim email lagi setelah pendaftaran Anda disetujui.`,
    ]),
  };
}

/** Sent when an admin approves the sign-up. */
export function approvalEmail(data: TrainingMail) {
  const title = escapeHtml(data.trainingTitle);
  return {
    subject: `Pendaftaran disetujui: ${data.trainingTitle}`,
    html: trainingMailHtml(
      data,
      "Pendaftaran disetujui",
      "Selamat, pendaftaran Anda untuk pelatihan berikut <b>sudah disetujui</b>. Sampai jumpa di pelatihan!",
      "Setelah pelatihan, scan QR yang ditampilkan trainer untuk klaim sertifikat. <b>Gunakan email ini</b> saat klaim, karena sertifikat hanya bisa diklaim oleh email yang terdaftar.",
      `your registration for <b>${title}</b> has been approved. After the training, scan the QR code to claim your certificate using this email address.`,
    ),
    text: trainingMailText(data, [
      `Pendaftaran Anda sudah disetujui. Sampai jumpa di pelatihan!`,
      `Setelah pelatihan, scan QR dari trainer untuk klaim sertifikat dengan email ini.`,
    ]),
  };
}
