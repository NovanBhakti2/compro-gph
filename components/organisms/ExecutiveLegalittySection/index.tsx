import React from "react";

const legalities = [
  {
    label: "Deed of Establishment",
    number: "No. 308, 18 September 2025",
  },
  {
    label: "Ministry of Law & Human Rights Approval",
    number: "No. AHU-0082606.AH.01.01.Tahun 2025",
  },
  {
    label: "Business Identification Number (NIB)",
    number: "No. 2310250110293",
  },
];

export const ExecutivesLegalitySection = () => {
  return (
    <div id="team" className="scroll-mt-24">
      {/* Executives Section */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#c5aa7a]/50 bg-[#c5aa7a]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
            <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
              Leadership & Expertise
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
            Our Executives
          </h2>
          <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            <p>
              Our team of consultants collectively bring over 20 years of
              extensive experience across the hospitality, manufacturing,
              certification, and professional training industries.
            </p>
            <p>
              With a strong foundation built through years of service in
              international hotel chains and multinational corporations, our
              consultants possess a deep understanding of global standards,
              operational excellence, and business sustainability. Each member
              of our team has contributed to the success of leading
              organizations by implementing effective management systems,
              enhancing service quality, and driving continuous improvement
              across diverse sectors.
            </p>
            <p>
              This wealth of cross-industry experience enables us to deliver
              strategic, practical, and impactful solutions that support our
              clients in achieving operational excellence and sustainable
              business growth.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-20 -mt-12">
        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
          <p className="text-xs sm:text-sm italic text-slate-700">
            &ldquo;Excellence is not a singular act, but a habit of continuous
            training and systems compliance.&rdquo;
          </p>
        </div>
      </div>

      <section className="py-20 px-6 lg:px-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#c5aa7a]/50 bg-[#c5aa7a]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                Corporate Integrity
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0f1932] tracking-tight">
              Company Legality
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {legalities.map((item, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#c5aa7a]/50 hover:bg-gradient-to-b hover:from-white hover:to-[#c5aa7a]/5 cursor-pointer"
              >
                {/* Wadah Ikon dengan efek animasi saat di-hover */}
                <div className="w-12 h-12 rounded-2xl bg-[#c5aa7a]/10 flex items-center justify-center text-[#c5aa7a] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#c5aa7a] group-hover:text-white shadow-sm">
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
