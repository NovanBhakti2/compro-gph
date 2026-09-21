"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DUMMY_NEWS, NewsItem } from "@/data/news";
import { FadeIn } from "@/components/atoms/animations/FadeIn";

const categories = [
  "All Articles",
  "5S Methodology",
  "Halal Assurance System",
  "Food Safety",
  "Revenue Management",
  "Quality Assurance",
  "License & Permits",
];

const formatDate = (dateValue?: Date | string | null) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
};

export default function CuratedArticlesSection({
  initialNews = DUMMY_NEWS,
}: {
  initialNews?: NewsItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredArticles = initialNews.filter((item) => {
    if (item.status !== "PUBLISHED") return false;
    if (selectedCategory === "All Articles") return true;

    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(6);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleLoadLess = () => {
    setVisibleCount(6);
  };

  return (
    <section id="curated-articles" className="py-20 px-6 lg:px-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-10">
        <FadeIn direction="up" delay={0.1}>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                Curated Insights
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
              Picked For You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Browse through our latest insights in operational excellence,
              quality compliance, and revenue growth.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#0f1932] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((article, idx) => (
            <FadeIn
              key={article.id}
              direction="up"
              delay={0.05 * ((idx % 3) + 1)}
            >
              <Link
                href={`/news/${article.slug}`}
                className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full space-y-5"
              >
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={
                        article.thumbnail_url ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-400">
                    <span className="text-[#9c7d42] uppercase">
                      {article.category || "FOOD SAFETY"}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0f1932] leading-snug group-hover:text-[#9c7d42] transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {article.content}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#0f1932] group-hover:text-[#9c7d42] transition-colors">
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
            </FadeIn>
          ))}
        </div>

        {visibleCount < filteredArticles.length ? (
          <FadeIn
            direction="up"
            delay={0.2}
            className="flex justify-center pt-6"
          >
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 rounded-full border border-[#0f1932] text-[#0f1932] text-xs font-bold hover:bg-[#0f1932] hover:text-white transition-all duration-300 shadow-sm hover:shadow"
            >
              Load More Articles
            </button>
          </FadeIn>
        ) : visibleArticles.length > 6 &&  (
          <FadeIn
            direction="up"
            delay={0.2}
            className="flex justify-center pt-6"
          >
            <button
              onClick={handleLoadLess}
              className="px-8 py-3 rounded-full border border-[#0f1932] text-[#0f1932] text-xs font-bold hover:bg-[#0f1932] hover:text-white transition-all duration-300 shadow-sm hover:shadow"
            >
              Less Articles
            </button>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
