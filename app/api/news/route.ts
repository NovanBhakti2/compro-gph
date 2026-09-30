// app/api/news/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const articles = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { published_at: "desc" },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}