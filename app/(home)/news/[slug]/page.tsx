// app/news/[slug]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const article = await prisma.news.findUnique({
    where: { slug },
    include: {
      categories: true,
      users: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const relatedArticles = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: article.id },
    },
    take: 3,
    include: { categories: true },
  });

  return (
    <article className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-20 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <div>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#C7974C] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>News & Articles</span>
            </Link>
          </div>
        </nav>

        <header className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
              {article.categories?.name || "Training Recap"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f1932] tracking-tight leading-[1.15]">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            A practical learning session focused on strengthening food-safety
            awareness, team capability, and consistent hospitality standards in
            daily operations.
          </p>
        </header>

        {article.thumbnail_url && (
          <div className="w-full h-[360px] sm:h-[520px] rounded-3xl overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="pt-4">
          <div
            className="prose max-w-none prose-slate"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {relatedArticles.length > 0 && (
          <section className="pt-16 border-t border-slate-200/80 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                CONTINUE READING
              </span>
              <h2 className="text-2xl font-extrabold text-[#0f1932]">
                Related articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/news/${rel.slug}`}
                  className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={
                          rel.thumbnail_url || "https://placehold.co/600x400"
                        }
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#9c7d42] uppercase tracking-wider">
                      {rel.categories?.name || "INSIGHTS"}
                    </span>
                    <h3 className="text-sm font-bold text-[#0f1932] group-hover:text-[#9c7d42] transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-[#0f1932] transition-colors">
                    <span>Read article</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
