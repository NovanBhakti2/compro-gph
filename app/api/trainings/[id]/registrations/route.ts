import { prisma } from "@/lib/prisma";
import { getDashboardUser } from "@/lib/dal";
import { contactKey, type Certificate, type Training } from "@/lib/certificates";
import { formatPhone, type Registration } from "@/lib/registrations";
import { buildXlsx } from "@/lib/xlsx";

const registeredFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const STATUS_LABEL: Record<string, string> = { PENDING: "Menunggu", APPROVED: "Disetujui", REJECTED: "Ditolak" };

/** Sign-ups of a training as an Excel file (dashboard only). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Trainings and certificates are admin-only
  if ((await getDashboardUser())?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const training: (Training & { registrations: Registration[]; certificates: Certificate[] }) | null =
    await prisma.trainings.findUnique({
      where: { id },
      include: { registrations: { orderBy: { created_at: "asc" } }, certificates: true },
    });
  if (!training) return new Response("Not found", { status: 404 });

  const certificates = new Map(training.certificates.map((c) => [c.contact_key, c]));
  const rows = [
    ["No", "Nama", "Email", "No. HP", "Tanggal daftar", "Status", "Sertifikat", "No. sertifikat"],
    ...training.registrations.map((r, i) => {
      const cert = certificates.get(contactKey(r.email));
      return [
        String(i + 1),
        r.name,
        r.email,
        formatPhone(r.phone),
        registeredFormat.format(r.created_at),
        STATUS_LABEL[r.status] ?? r.status,
        cert ? "Sudah klaim" : "Belum klaim",
        cert?.number ?? "",
      ];
    }),
  ];
  const file = buildXlsx("Pendaftar", rows, [5, 30, 32, 18, 22, 12, 14, 22]);

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Pendaftar-${training.slug}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
