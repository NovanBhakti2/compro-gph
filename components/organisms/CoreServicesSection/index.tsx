import React from "react";
import Image from "next/image";

const coreServices = [
  {
    title: "Training",
    desc: "The Training service is designed to build internal capabilities and empower teams with the knowledge and skills necessary to sustain operational excellence. Programs are customized based on industry needs – including food safety, quality assurance, hospitality standards, and leadership development.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
    icon: (
      <svg
        className="w-5 h-5 text-[#c5aa7a]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: "Consulting",
    desc: "The Consultant service aims to provide strategic and technical guidance to improve overall business performance, quality systems, and sustainability. We work closely with clients to design tailored solutions that align with their goals – from enhancing operational efficiency and customer satisfaction to ensuring regulatory compliance.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
    icon: (
      <svg
        className="w-5 h-5 text-[#c5aa7a]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Audit & Evaluation",
    desc: "The Audit service focuses on assessing and verifying compliance with relevant standards, regulations, and internal policies. Through systematic inspections and evaluations, we identify potential gaps and risks in operational processes related to food safety, quality management, and hospitality performance.",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop",
    icon: (
      <svg
        className="w-5 h-5 text-[#c5aa7a]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export const CoreServicesSection = () => {
  return (
    <section
      id="services"
      className="py-24 px-6 lg:px-20 bg-white scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#c5aa7a]/50 bg-[#c5aa7a]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
            <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
              What We Deliver
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
            Our Core Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coreServices.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-100/80 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:brightness-105"
                />
                <div className="absolute inset-0 bg-[#0f1932]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6 flex flex-col flex-1 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </span>
                  <h3 className="text-xl font-bold text-[#0f1932] group-hover:text-[#c5aa7a] transition-colors duration-300">
                    {service.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
