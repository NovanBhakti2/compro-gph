// app/api/news/route.ts
import { NextResponse } from "next/server";
import { getPublishedNews } from "@/lib/news";

export async function GET() {
  try {
    const articles = await getPublishedNews();
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}
