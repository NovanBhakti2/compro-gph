import React from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export const ComprehensiveServicesSection = ({ dict }: { dict: Dictionary["expertise"] }) => {
  const expertiseList = dict.items;

  return (
    <section className="py-24 px-6 lg:px-20 bg-[#0f1932] text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/20 bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold text-[#C7974C] tracking-wide">
              {dict.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {dict.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertiseList.map((item, index) => (
            <div
              key={index}
              className="group bg-[#152347]/60 hover:bg-[#1c2e5c]/80 border border-slate-700/60 hover:border-[#C7974C] p-8 rounded-3xl space-y-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#C7974C]/10 cursor-pointer"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5 transition-colors duration-300 group-hover:text-[#C7974C]">
                <span className="w-2 h-2 rounded-full bg-[#C7974C] transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_8px_#C7974C]" />
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-200 leading-relaxed font-light transition-colors duration-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
