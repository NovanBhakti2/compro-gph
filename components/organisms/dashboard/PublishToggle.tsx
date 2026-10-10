"use client";

import { useTransition } from "react";
import { togglePublish } from "@/app/actions/articles";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      disabled={pending}
      onClick={() => startTransition(() => togglePublish(id))}
      title={published ? "Klik untuk unpublish" : "Klik untuk publish"}
      className="inline-flex items-center gap-2 disabled:opacity-60"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          published ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            published ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
      <span
        className={`text-xs font-semibold ${published ? "text-emerald-700" : "text-slate-500"}`}
      >
        {pending ? "Menyimpan..." : published ? "Published" : "Unpublished"}
      </span>
    </button>
  );
}
