import { NextResponse } from "next/server";
import { getDashboardUser } from "@/lib/dal";
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await getDashboardUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan login ulang." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
  }

  try {
    const result = await saveImage(file);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    // Storage failure, e.g. invalid Blob token or quota exceeded
    console.error("upload:", error);
    return NextResponse.json({ error: "Upload gagal, coba lagi." }, { status: 500 });
  }
}
