"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/app/actions/users";
import { Icon, buttonClass } from "./ui";

type Props = {
  user: { id: string; name: string; email: string; role: string; articleCount: number };
  isSelf: boolean;
};

export function UserRow({ user, isSelf }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    const note = user.articleCount
      ? `\n\n${user.articleCount} artikelnya tidak ikut terhapus, tetapi dipindahkan ke akun Anda.`
      : "";
    if (!confirm(`Hapus pengguna "${user.name}"? Ia tidak bisa login lagi.${note}`)) return;
    startTransition(async () => {
      const result = await deleteUser(user.id);
      setError(result.error ?? null);
    });
  };

  return (
    <li className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0f1932]">
            {user.name}
            {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(Anda)</span>}
          </p>
          <p className="truncate text-xs text-slate-400">
            {user.email} &middot; {user.articleCount} artikel
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            user.role === "ADMIN"
              ? "bg-[#C7974C]/12 text-[#8a6a32]"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {user.role}
        </span>
        {!isSelf && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            title="Hapus pengguna"
            aria-label={`Hapus ${user.name}`}
            className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
          >
            <Icon name="trash" className={pending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </li>
  );
}
