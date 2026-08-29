'use client';

import React from 'react';

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-6 lg:px-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#c5aa7a]/50 bg-[#c5aa7a]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5aa7a]" />
              <span className="text-xs font-semibold text-[#9c7d42] tracking-wide">Get In Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1932] tracking-tight">
              Contact Us
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Have questions about our training or consulting services? Reach out to our Jakarta headquarters teams today.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[#0f1932]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone Support</p>
                <p className="text-sm font-bold text-slate-800">+62 81122887789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[#0f1932]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email Inquiry</p>
                <p className="text-sm font-bold text-slate-800">gamaputraharmoni@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[#0f1932]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400">Headquarters Address</p>
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  PT. Gama Putra Harmoni<br />
                  <span className="font-normal text-slate-600">Jl. Bango III, No. 5A, Pondok Labu, Cilandak, Jakarta Selatan, Indonesia</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-100">
          <h3 className="text-xl font-bold text-[#0f1932] mb-6">Send a Message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#c5aa7a]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#c5aa7a]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Subject</label>
              <input
                type="text"
                placeholder="How can we assist you?"
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#c5aa7a]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Message</label>
              <textarea
                rows={4}
                placeholder="Describe your requirements in detail..."
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#c5aa7a] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#0f1932] hover:bg-[#182850] text-white font-semibold rounded-xl text-sm transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};