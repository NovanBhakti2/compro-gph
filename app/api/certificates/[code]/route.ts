import { prisma } from "@/lib/prisma";
import { CERTIFICATE_INCLUDE, certificateFileName, certificatePdf, type CertificateWithTraining } from "@/lib/certificates";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert: CertificateWithTraining | null = /^[A-Z0-9]{8}$/.test(code)
    ? await prisma.certificates.findUnique({ where: { code }, include: CERTIFICATE_INCLUDE })
    : null;
  if (!cert) return new Response("Not found", { status: 404 });

  const pdf = await certificatePdf(cert);
  const inline = new URL(request.url).searchParams.has("view");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${certificateFileName(cert)}"`,
      // The name can be corrected in the dashboard, so always rebuild
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
