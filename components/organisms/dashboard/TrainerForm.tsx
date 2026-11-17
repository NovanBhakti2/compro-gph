"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import type { TrainerFormState } from "@/app/actions/trainers";
import { ImageUpload } from "./ImageUpload";
import { Card, Field, Icon, buttonClass, inputClass } from "./ui";

export type TrainerFormValues = { name: string; title: string; signature_url: string };

type Props = {
  heading: string;
  action: (state: TrainerFormState, formData: FormData) => Promise<TrainerFormState>;
  initialValues?: TrainerFormValues;
};

export function TrainerForm({ heading, action, initialValues }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [v, setV] = useState<TrainerFormValues>(initialValues ?? { name: "", title: "Trainer", signature_url: "" });
  const errors = state?.errors;
  const hasErrors = Boolean(state?.message || (errors && Object.keys(errors).length));

  const previewHref = `/api/certificates/preview?${new URLSearchParams({
    name: v.name || "Nama Trainer",
    title: v.title || "Trainer",
    signature: v.signature_url,
  })}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard/trainers" aria-label="Kembali" className={buttonClass("secondary", "icon")}>
            <Icon name="back" />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">Sertifikat · Trainer</p>
            <h1 className="truncate text-lg font-extrabold tracking-tight text-[#0f1932]">{heading}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={previewHref} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
            <Icon name="eye" />
            <span className="hidden sm:inline">Pratinjau sertifikat</span>
          </a>
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            <Icon name="check" />
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      {hasErrors && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icon name="x" className="mt-0.5 h-4 w-4" />
          <p>{state?.message ?? "Belum bisa disimpan. Periksa kembali isian yang ditandai merah."}</p>
        </div>
      )}

      <Card title="Trainer" description="Tercetak di bawah garis tanda tangan sertifikat." bodyClassName="space-y-5 p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama" htmlFor="name" error={errors?.name} hint="Lengkap dengan gelar kalau perlu.">
            <input
              id="name"
              name="name"
              value={v.name}
              onChange={(e) => setV({ ...v, name: e.target.value })}
              maxLength={100}
              placeholder="mis. Budi Santoso, S.TP."
              className={inputClass}
            />
          </Field>
          <Field label="Jabatan" htmlFor="title" error={errors?.title} hint="Bahasa Inggris, sesuai sertifikat.">
            <input
              id="title"
              name="title"
              value={v.title}
              onChange={(e) => setV({ ...v, title: e.target.value })}
              maxLength={100}
              placeholder="Trainer"
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Tanda tangan"
        description="Foto/scan tanda tangan di kertas putih, lalu hapus latarnya (mis. remove.bg) dan simpan sebagai PNG. Potong rapat di sekitar tanda tangan."
      >
        <div className="mx-auto max-w-md">
          <ImageUpload
            name="signature_url"
            value={v.signature_url}
            onChange={(url) => setV({ ...v, signature_url: url })}
            error={errors?.signature_url?.[0]}
            variant="signature"
          />
        </div>
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          Kosongkan kalau sertifikat tidak perlu tanda tangan. Klik <b>Pratinjau sertifikat</b> untuk melihat hasilnya
          sebelum disimpan.
        </p>
      </Card>
    </form>
  );
}
