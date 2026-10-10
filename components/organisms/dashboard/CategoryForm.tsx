"use client";

import { useActionState, useState } from "react";
import type { CategoryFormState } from "@/app/actions/categories";
import { slugify } from "@/lib/slugify";
import { Field, buttonClass, inputClass } from "./ui";

type Values = { name: string; slug: string; description: string | null };

type Props = {
  action: (state: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  initialValues?: Values;
  submitLabel: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Two-column layout for editing inside a table row */
  inline?: boolean;
};

export function CategoryForm({
  action,
  initialValues,
  submitLabel,
  onSuccess,
  onCancel,
  inline = false,
}: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [description, setDescription] = useState(initialValues?.description ?? "");

  const [state, formAction, pending] = useActionState(
    async (prev: CategoryFormState, formData: FormData) => {
      const result = await action(prev, formData);
      if (result?.ok) {
        if (!initialValues) {
          // Add form: clear for the next category
          setName("");
          setSlug("");
          setSlugTouched(false);
          setDescription("");
        }
        onSuccess?.();
      }
      return result;
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className={inline ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
        <Field label="Nama" error={state?.errors?.name}>
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
            placeholder="mis. Halal Assurance"
            aria-label="Nama"
            className={inputClass}
          />
        </Field>

        <Field label="Slug" error={state?.errors?.slug} hint={inline ? undefined : "Dibuat otomatis dari nama."}>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            onBlur={() => setSlug(slugify(slug))}
            aria-label="Slug"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label={
          <>
            Deskripsi <span className="font-normal text-slate-400">(opsional)</span>
          </>
        }
        error={state?.errors?.description}
      >
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          aria-label="Deskripsi"
          className={`${inputClass} resize-y`}
        />
      </Field>

      {state?.message && <p className="text-xs font-medium text-red-600">{state.message}</p>}

      <div className={`flex gap-2 ${inline ? "justify-end" : ""}`}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonClass("secondary", "sm")}>
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className={inline ? buttonClass("primary", "sm") : `${buttonClass("primary")} w-full`}
        >
          {pending ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
