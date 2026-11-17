import { getDashboardUser } from "@/lib/dal";
import { readUploadedImage } from "@/lib/certificates";
import { renderCertificate } from "@/lib/certificate/pdf";

/**
 * Sample certificate for the trainer form (dashboard only): shows how the
 * name, title and signature sit on the template before saving.
 * /api/certificates/preview?name=…&title=…&signature=…
 */
export async function GET(request: Request) {
  if (!(await getDashboardUser())) return new Response("Unauthorized", { status: 401 });

  const params = new URL(request.url).searchParams;
  const name = params.get("name")?.trim().slice(0, 100);
  const pdf = await renderCertificate({
    participantName: "Nama Peserta",
    trainingTitle: params.get("training")?.trim().slice(0, 200) || "Food Safety for Food Handlers",
    date: "8 November 2026",
    number: "000/GPH/TRN/PREVIEW",
    trainer: name
      ? {
          name,
          title: params.get("title")?.trim().slice(0, 100) || "Trainer",
          signature: await readUploadedImage(params.get("signature")),
        }
      : undefined,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Preview.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
