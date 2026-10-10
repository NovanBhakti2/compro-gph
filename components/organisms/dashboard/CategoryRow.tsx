"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteCategory, updateCategory } from "@/app/actions/categories";
import { CategoryForm } from "./CategoryForm";
import { CATEGORY_COLUMNS, Icon, buttonClass } from "./ui";

type Props = {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    articleCount: number;
  };
};

export function CategoryRow({ category }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="bg-[#C7974C]/[0.04] px-5 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9c7d42]">
          Edit kategori
        </p>
        <CategoryForm
          inline
          action={updateCategory.bind(null, category.id)}
          initialValues={category}
          submitLabel="Simpan"
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const onDelete = () => {
    const note = category.articleCount
      ? `\n\n${category.articleCount} artikel di kategori ini akan menjadi "Tanpa kategori".`
      : "";
    if (!confirm(`Hapus kategori "${category.name}"?${note}`)) return;
    startTransition(() => deleteCategory(category.id));
  };

  return (
    <li
      className={`grid grid-cols-1 items-center gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50/60 sm:gap-4 ${CATEGORY_COLUMNS}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C7974C]/12 text-[#9c7d42]">
          <Icon name="tag" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0f1932]">{category.name}</p>
          <p className="truncate text-xs text-slate-400">
            /{category.slug}
            {category.description && <> &middot; {category.description}</>}
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/articles?category=${category.id}`}
        className="w-fit rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
      >
        {category.articleCount} artikel
      </Link>

      <div className="flex items-center gap-0.5 sm:justify-end">
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Edit"
          aria-label="Edit"
          className={buttonClass("ghost", "icon")}
        >
          <Icon name="edit" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          title="Hapus"
          aria-label="Hapus"
          className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
        >
          <Icon name="trash" className={pending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
        </button>
      </div>
    </li>
  );
}
