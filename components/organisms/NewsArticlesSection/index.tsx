"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NewsItem } from "@/data/news";
import { FadeIn } from "@/components/atoms/animations/FadeIn";
import { SlideIn } from "@/components/atoms/animations/SlideIn";

interface NewsArticlesSectionProps {
  initialNews?: NewsItem[];
}

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

export default function NewsArticlesSection({
  initialNews = [],
}: NewsArticlesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);

  const newsList = initialNews.filter((item) => item.status === "PUBLISHED");

  console.log("NewsArticlesSection - initialNews:", initialNews);

  if (!newsList || newsList.length === 0) return null;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % newsList.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? newsList.length - 1 : prev - 1));
  };

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const getFirstParagraph = (htmlContent: string) => {
    if (!htmlContent) return "";

    const match = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);

    if (match && match[1]) {
      return match[1].replace(/<[^>]+>/g, "");
    }

    return htmlContent.replace(/<[^>]+>/g, "");
  };

  const featuredNews = newsList[currentIndex];
  const secondaryNews = newsList[(currentIndex + 1) % newsList.length];

  return (
    <section id="news" className="py-24 px-6 lg:px-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
                <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                  Insights & Updates
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
                News & Articles
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl">
                Stay updated with our latest activities, insights, and
                professional expertise.
              </p>
            </div>

            <Link
              href="/news/#curated-articles"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#C7974C] transition-colors group self-start md:self-auto"
            >
              <span>View all articles</span>
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[420px]">
          <SlideIn
            activeKey={featuredNews.id}
            direction={direction}
            className="lg:col-span-8"
          >
            <div className="group relative rounded-3xl overflow-hidden bg-[#0f1932] shadow-sm border border-slate-100 flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 relative min-h-[260px] md:min-h-full overflow-hidden bg-slate-800">
                <img
                  src={
                    featuredNews.thumbnail_url ||
                    "https://placehold.co/800x600?text=No+Image"
                  }
                  alt={featuredNews.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-between text-white space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-300">
                    <span className="text-[#C7974C]">NEWS</span>
                    <span>•</span>
                    <span>
                      {formatDate(
                        featuredNews.published_at || featuredNews.created_at,
                      )}
                    </span>
                  </div>

                  <div className="inline-block px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
                    Featured Insight
                  </div>

                  <h3 className="text-2xl font-bold leading-tight group-hover:text-[#C7974C] transition-colors">
                    {featuredNews.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {getFirstParagraph(featuredNews.content)}
                  </p>
                </div>

                <Link
                  href={`/news/${featuredNews.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#C7974C] transition-colors group/btn pt-2"
                >
                  <span>Read article</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </SlideIn>

          {/* Secondary News */}
          {secondaryNews && (
            <SlideIn
              activeKey={secondaryNews.id}
              direction={direction}
              className="lg:col-span-4"
            >
              <Link
                href={`/news/${secondaryNews.slug}`}
                className="group relative bg-white rounded-3xl border border-slate-100 p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full space-y-6 block"
              >
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={
                        secondaryNews.thumbnail_url ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={secondaryNews.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-400">
                    <span className="text-[#9c7d42]">NEWS</span>
                    <span>•</span>
                    <span>
                      {formatDate(
                        secondaryNews.published_at || secondaryNews.created_at,
                      )}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[#0f1932] leading-snug group-hover:text-[#9c7d42] transition-colors">
                    {secondaryNews.title}
                  </h4>
                </div>
              </Link>
            </SlideIn>
          )}
        </div>

        {/* Carousel Indicators & Navigation */}
        <FadeIn direction="up" delay={0.2}>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {newsList.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? "w-8 bg-[#0f1932]"
                      : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors active:scale-90"
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
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-[#0f1932] text-white flex items-center justify-center hover:bg-[#C7974C] transition-colors active:scale-90 shadow-sm"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
