"use client";

import { useTransition } from "react";
import { deleteArticle } from "@/app/actions/articles";
import { Icon, buttonClass } from "./ui";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title="Hapus"
      aria-label="Hapus"
      onClick={() => {
        if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        startTransition(() => deleteArticle(id));
      }}
      className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
    >
      <Icon name="trash" className={pending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
    </button>
  );
}
