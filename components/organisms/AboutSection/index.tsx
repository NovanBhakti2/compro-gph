import React from "react";
import Image from "next/image";
import { FadeIn } from "@/components/atoms/animations/FadeIn";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 lg:px-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <FadeIn delay={0.2} direction="right">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#c5aa7a]/50 bg-[#c5aa7a]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">
                About The Company
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
              PT. Gama Putra Harmoni
            </h2>

            <div className="space-y-4 text-slate-600 text-base leading-relaxed">
              <p>
                PT. Gama Putra Harmoni is a professional consulting and training
                company committed to helping organizations improve performance,
                compliance, and operational excellence.
              </p>
              <p>
                We specialize in hospitality, food safety, and quality
                management systems — offering expert guidance and tailored
                solutions that deliver tangible results and sustainable growth.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} direction="left">
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <Image
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
              alt="PT Gama Putra Harmoni Meeting"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
