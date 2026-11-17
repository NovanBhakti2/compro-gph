"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePromo, togglePromo } from "@/app/actions/promos";
import { Icon, buttonClass } from "./ui";

/** Active switch + edit/delete buttons for one promo in the list. */
export function PromoActions({ id, title, active }: { id: string; title: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={active ? "Nonaktifkan" : "Aktifkan"}
        title={active ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
        disabled={pending}
        onClick={() => startTransition(() => togglePromo(id))}
        className="mr-1 disabled:opacity-60"
      >
        <span className={`relative block h-5 w-9 rounded-full transition-colors ${active ? "bg-emerald-500" : "bg-slate-300"}`}>
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${active ? "left-[18px]" : "left-0.5"}`}
          />
        </span>
      </button>
      <Link href={`/dashboard/promos/${id}`} title="Edit" aria-label="Edit" className={buttonClass("ghost", "icon")}>
        <Icon name="edit" />
      </Link>
      <button
        type="button"
        title="Hapus"
        aria-label="Hapus"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Hapus promo "${title}"?`)) return;
          startTransition(() => deletePromo(id));
        }}
        className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
      >
        <Icon name="trash" />
      </button>
    </div>
  );
}
