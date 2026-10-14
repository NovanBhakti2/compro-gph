import React from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

// role/bio per founder come from dict.team.founders (same order)
const founderProfiles = [
  {
    name: "Hendi Gharnida",
    image: "/bio/hendi.jpeg",
    linkedin: "https://www.linkedin.com/in/hendi-gharnida-01268b24/",
  },
  {
    name: "Dyah Saptorini",
    image: "/bio/dyah.jpeg",
    linkedin: "https://www.linkedin.com/in/dyah-saptorini-64673963/",
  },
  {
    name: "Muhammad Renandra Ichsansyah",
    image: "/bio/andra.jpeg",
    linkedin:
      "https://www.linkedin.com/in/muhammad-renandra-ichsansyah-20134633/",
  },
];

// Labels come from dict.team.legalities (same order)
const legalityNumbers = [
  {
    number: "No. 308, 18 September 2025",
  },
  {
    number: "No. AHU-0082606.AH.01.01.Tahun 2025",
  },
  {
    number: "No. 2310250110293",
  },
];

export const ExecutivesLegalitySection = ({ dict }: { dict: Dictionary["team"] }) => {
  const founders = founderProfiles.map((f, i) => ({ ...f, ...dict.founders[i] }));
  const legalities = legalityNumbers.map((l, i) => ({ ...l, label: dict.legalities[i] }));

  return (
    <div id="team" className="scroll-mt-24">
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
            <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
              {dict.badge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
            {dict.title}
          </h2>
          <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            {dict.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 px-6 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl border border-slate-100 p-6 shadow-sm md:hover:shadow-xl transition-all duration-300 md:hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1932]/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#9c7d42] tracking-wider uppercase">
                    {founder.role}
                  </span>
                  <h3 className="text-xl font-bold text-[#0f1932] mt-0.5">
                    {founder.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={founder.linkedin}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0f1932] md:group-hover:text-[#C7974C] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                  </svg>
                  {dict.connect}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-20 -mt-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
          <p className="text-xs sm:text-sm italic text-slate-700">
            &ldquo;{dict.quote}&rdquo;
          </p>
        </div>
      </div>

      <section className="py-20 px-6 lg:px-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#C7974C]/50 bg-[#C7974C]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7974C]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                {dict.legalityBadge}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0f1932] tracking-tight">
              {dict.legalityTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {legalities.map((item, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#C7974C]/50 hover:bg-gradient-to-b hover:from-white hover:to-[#C7974C]/5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#C7974C]/10 flex items-center justify-center text-[#C7974C] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C7974C] group-hover:text-white shadow-sm">
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-1 transition-colors duration-300 group-hover:text-[#9c7d42]">
                    {item.label}
                  </h4>
                  <p className="text-sm font-bold text-slate-800 transition-colors duration-300 group-hover:text-[#0f1932]">
                    {item.number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
