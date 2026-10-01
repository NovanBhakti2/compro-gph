// components/NewsSkeleton.tsx
import React from "react";

export function NewsSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-6 lg:px-20 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="space-y-4 max-w-2xl">
          <div className="h-6 w-36 bg-slate-200 rounded-full" />
          <div className="h-10 w-3/4 bg-slate-200 rounded-xl" />
          <div className="h-4 w-full bg-slate-200 rounded-lg" />
        </div>

        <div className="w-full h-[380px] sm:h-[480px] bg-slate-200 rounded-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-11/12" />
            <div className="h-4 bg-slate-200 rounded w-4/5" />
            <div className="h-20 bg-slate-200 rounded-2xl mt-6" />
          </div>

          <div className="lg:col-span-5 h-72 bg-slate-200 rounded-3xl" />
        </div>

        <div className="flex items-center justify-center space-x-3 pt-8">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-[#C7974C] rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            Memuat Artikel Gama Putra Harmoni...
          </span>
        </div>

      </div>
    </div>
  );
}