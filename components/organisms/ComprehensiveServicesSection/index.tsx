import React from "react";

const expertiseList = [
  {
    title: "5S Methodology",
    desc: "Implementing Seiri, Seiton, Seiso, Seiketsu, Shitsuke to enhance the workplace organization, productivity, and absolute operational discipline.",
  },
  {
    title: "Halal Assurance System",
    desc: "Complete guidance and support for Halal certification including strategic documentation, training, and full audit readiness.",
  },
  {
    title: "Food Safety",
    desc: "Comprehensive support for Good Manufacturing Practices (GMP), Hazard Analysis and Critical Control Points (HACCP), ISO 22000, and FSSC 22000 Certification systems to safeguard supply chain integrity.",
  },
  {
    title: "Revenue Management",
    desc: "Develop revenue management and E-commerce strategies through analytical reporting, budgeting, forecasting, and pricing optimization to maximize profitability.",
  },
  {
    title: "Quality Assurance",
    desc: "Developing and implementing quality systems, internal audits, and performance monitoring to ensure consistent product and service excellence.",
  },
  {
    title: "License & Permits",
    desc: "Assisting business in meeting regulatory requirements, including business licensing, food permits, and hospitality compliance documentations.",
  },
];

export const ComprehensiveServicesSection = () => {
  return (
    <section className="py-24 px-6 lg:px-20 bg-[#0f1932] text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/20 bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
            <span className="text-xs font-semibold text-[#c5aa7a] tracking-wide">
              Expertise Directory
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Our Comprehensive Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertiseList.map((item, index) => (
            <div
              key={index}
              className="group bg-[#152347]/60 hover:bg-[#1c2e5c]/80 border border-slate-700/60 hover:border-[#c5aa7a] p-8 rounded-3xl space-y-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#c5aa7a]/10 cursor-pointer"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5 transition-colors duration-300 group-hover:text-[#c5aa7a]">
                <span className="w-2 h-2 rounded-full bg-[#c5aa7a] transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_8px_#c5aa7a]" />
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
