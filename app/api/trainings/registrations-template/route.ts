import { getDashboardUser } from "@/lib/dal";
import { buildXlsx } from "@/lib/xlsx";

/** Empty attendee list to fill in and import (dashboard only). */
export async function GET() {
  if ((await getDashboardUser())?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const file = buildXlsx("Pendaftar", [["Nama", "Email", "No. HP"]], [32, 34, 20]);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Template-Pendaftar.xlsx"',
      "Cache-Control": "private, no-store",
    },
  });
}
