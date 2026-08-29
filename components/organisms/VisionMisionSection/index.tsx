"use client";

import { FadeIn } from "@/components/atoms/animations/FadeIn";
import React, { useState } from "react";

export const VisionMissionSection = () => {
  // Default awal aktif di 'mission' agar salah satu kartu langsung bertema gelap
  const [activeCard, setActiveCard] = useState<"mission" | "vision">("mission");

  const handleCardClick = (card: "mission" | "vision") => {
    setActiveCard(card);
  };

  return (
    <section className="py-20 px-6 lg:px-20 bg-slate-50/60">
      <div className="max-w-7xl mx-auto space-y-10">
        <FadeIn delay={0.2} direction="down">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#c5aa7a]/50 bg-[#c5aa7a]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                Our Foundation
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
              Driving Standards of
              <br />
              Excellence
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <FadeIn delay={0.2} direction="right" className="h-full">
            <div
              onClick={() => handleCardClick("mission")}
              className={`h-full p-8 sm:p-10 rounded-3xl cursor-pointer transition-all duration-500 flex flex-col justify-between space-y-8 select-none ${
                activeCard === "mission"
                  ? "bg-[#0f1932] text-white shadow-2xl scale-[1.02] border border-[#c5aa7a]/30"
                  : "bg-white text-slate-800 shadow-sm border border-slate-100 hover:border-slate-200"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                  activeCard === "mission"
                    ? "bg-[#c5aa7a] text-[#0f1932]"
                    : "bg-slate-900 text-white"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <h3
                  className={`text-2xl font-bold mb-3 transition-colors duration-500 ${
                    activeCard === "mission" ? "text-white" : "text-[#0f1932]"
                  }`}
                >
                  Our Mission
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed transition-colors duration-500 ${
                    activeCard === "mission" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Becoming the most preferred partner in building a culture that
                  values quality, safety, and sustainability.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Vision Card */}
          <FadeIn delay={0.2} direction="left" className="h-full">
            <div
              onClick={() => handleCardClick("vision")}
              className={`h-full p-8 sm:p-10 rounded-3xl cursor-pointer transition-all duration-500 flex flex-col justify-between space-y-8 select-none ${
                activeCard === "vision"
                  ? "bg-[#0f1932] text-white shadow-2xl scale-[1.02] border border-[#c5aa7a]/30"
                  : "bg-white text-slate-800 shadow-sm border border-slate-100 hover:border-slate-200"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                  activeCard === "vision"
                    ? "bg-[#c5aa7a] text-[#0f1932]"
                    : "bg-slate-900 text-white"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className={`text-2xl font-bold mb-3 transition-colors duration-500 ${
                    activeCard === "vision" ? "text-white" : "text-[#0f1932]"
                  }`}
                >
                  Our Vision
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed transition-colors duration-500 ${
                    activeCard === "vision" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  To enhance business performance and integrity through
                  impactful training and consultancy.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};