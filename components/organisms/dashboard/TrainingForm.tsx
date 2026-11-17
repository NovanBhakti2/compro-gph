"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { Label, ListBox, Select } from "@heroui/react";
import type { FormState } from "@/app/actions/certificates";
import { ArticleDatePicker } from "./ArticleDatePicker";
import { Card, Field, Icon, buttonClass, inputClass } from "./ui";

export type TrainingFormValues = {
  title: string;
  /** "YYYY-MM-DD" */
  starts_on: string;
  ends_on: string;
  claim_until: string;
  /** "HH:MM" in WIB */
  claim_time: string;
  /** "HH:MM" in WIB, or "" */
  time_start: string;
  time_end: string;
  location: string;
  is_open: boolean;
  registration_open: boolean;
  /** "" = none: the trainer space on the certificate stays blank */
  trainer_id: string;
};

export type TrainerOption = { id: string; name: string; title: string; hasSignature: boolean };

type Props = {
  heading: string;
  backHref: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: TrainingFormValues;
  trainers: TrainerOption[];
};

// React Aria keys can't be empty strings
const NO_TRAINER = "__none__";

const EMPTY: TrainingFormValues = {
  title: "",
  starts_on: "",
  ends_on: "",
  claim_until: "",
  claim_time: "23:59",
  time_start: "",
  time_end: "",
  location: "",
  is_open: true,
  registration_open: true,
  trainer_id: "",
};

const switchTrack =
  "relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-4 peer-focus-visible:ring-[#C7974C]/30 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5";
const CLAIM_DAYS = 3;

function addDays(value: string, days: number) {
  const d = new Date(`${value}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function TrainingForm({ heading, backHref, action, initialValues, trainers }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // A new training starts with the first trainer, so certificates get a signature
  const [v, setV] = useState<TrainingFormValues>(initialValues ?? { ...EMPTY, trainer_id: trainers[0]?.id ?? "" });
  // Suggest a claim deadline until the admin picks one themselves
  const [claimTouched, setClaimTouched] = useState(Boolean(initialValues?.claim_until));
  const set = (patch: Partial<TrainingFormValues>) =>
    setV((all) => {
      const next = { ...all, ...patch };
      const lastDay = next.ends_on || next.starts_on;
      if (!claimTouched && lastDay) next.claim_until = addDays(lastDay, CLAIM_DAYS);
      return next;
    });

  const errors = state?.errors;
  const hasErrors = Boolean(state?.message || (errors && Object.keys(errors).length));

  return (
    <form
      // Submitted by hand so a failed save doesn't reset the switch (see PromoForm)
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={backHref} aria-label="Kembali" className={buttonClass("secondary", "icon")}>
            <Icon name="back" />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">Sertifikat</p>
            <h1 className="truncate text-lg font-extrabold tracking-tight text-[#0f1932]">{heading}</h1>
          </div>
        </div>
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          <Icon name="check" />
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {hasErrors && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icon name="x" className="mt-0.5 h-4 w-4" />
          <p>{state?.message ?? "Belum bisa disimpan. Periksa kembali isian yang ditandai merah."}</p>
        </div>
      )}

      <Card
        title="Training"
        description="Nama dan tanggal ini tercetak di sertifikat peserta."
        bodyClassName="space-y-5 p-5"
      >
        <Field
          label="Nama training"
          htmlFor="title"
          error={errors?.title}
          hint="Tulis dalam bahasa Inggris, sesuai desain sertifikat. Contoh: Food Safety for Food Handlers"
        >
          <input
            id="title"
            name="title"
            value={v.title}
            onChange={(e) => set({ title: e.target.value })}
            maxLength={200}
            placeholder="Food Safety for Food Handlers"
            className={inputClass}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tanggal training" htmlFor="starts_on" error={errors?.starts_on}>
            <ArticleDatePicker
              id="starts_on"
              name="starts_on"
              label="Tanggal training"
              value={v.starts_on}
              onChange={(d) => set({ starts_on: d })}
              isInvalid={Boolean(errors?.starts_on)}
            />
          </Field>
          <Field
            label="Sampai tanggal"
            htmlFor="ends_on"
            error={errors?.ends_on}
            hint="Isi kalau training lebih dari 1 hari."
          >
            <ArticleDatePicker
              id="ends_on"
              name="ends_on"
              label="Sampai tanggal"
              value={v.ends_on}
              onChange={(d) => set({ ends_on: d })}
              isInvalid={Boolean(errors?.ends_on)}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <Field
            label="Jam (WIB)"
            htmlFor="time_start"
            error={errors?.time_start ?? errors?.time_end}
            hint="Opsional. Jam selesai boleh dikosongkan."
          >
            <div className="flex items-center gap-2">
              <input
                id="time_start"
                type="time"
                name="time_start"
                value={v.time_start}
                onChange={(e) => set({ time_start: e.target.value })}
                aria-label="Jam mulai"
                className={inputClass}
              />
              <span className="text-slate-400">–</span>
              <input
                type="time"
                name="time_end"
                value={v.time_end}
                onChange={(e) => set({ time_end: e.target.value })}
                aria-label="Jam selesai"
                className={inputClass}
              />
            </div>
          </Field>
          <Field label="Lokasi" htmlFor="location" error={errors?.location} hint="Opsional. Tampil di jadwal dan form pendaftaran.">
            <input
              id="location"
              name="location"
              value={v.location}
              onChange={(e) => set({ location: e.target.value })}
              maxLength={200}
              placeholder="mis. Hotel Aston, Denpasar  /  Online (Zoom)"
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Trainer"
        description="Nama, jabatan, dan tanda tangan yang tercetak di sertifikat."
        actions={
          <Link href="/dashboard/trainers" className={buttonClass("ghost", "sm")}>
            Kelola trainer
          </Link>
        }
        bodyClassName="space-y-3 p-5"
      >
        <Select
          id="trainer_id"
          className="w-full"
          value={v.trainer_id || NO_TRAINER}
          onChange={(key) => setV((all) => ({ ...all, trainer_id: key && key !== NO_TRAINER ? String(key) : "" }))}
        >
          <Label className="sr-only">Trainer</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {trainers.map((t) => (
                <ListBox.Item key={t.id} id={t.id} textValue={t.name}>
                  <span>
                    {t.name}
                    <span className="ml-2 text-xs text-slate-400">
                      {t.title}
                      {!t.hasSignature && " · tanpa tanda tangan"}
                    </span>
                  </span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
              <ListBox.Item id={NO_TRAINER} textValue="Tanpa trainer">
                <span className="text-slate-500">Tanpa trainer (nama dan tanda tangan dikosongkan)</span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
        <input type="hidden" name="trainer_id" value={v.trainer_id} />
        {trainers.length === 0 && (
          <p className="text-[11px] text-slate-400">
            Belum ada trainer.{" "}
            <Link href="/dashboard/trainers/new" className="font-semibold text-[#9c7d42]">
              Tambah trainer
            </Link>{" "}
            untuk memasang tanda tangan.
          </p>
        )}
      </Card>

      <Card
        title="Pendaftaran"
        description="Form pendaftaran di halaman /register. Hanya email yang mendaftar yang bisa klaim sertifikat."
        bodyClassName="space-y-3 p-5"
      >
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-semibold text-slate-700">Pendaftaran dibuka</span>
            <span className="block text-[11px] text-slate-400">
              Otomatis tutup setelah hari terakhir training. Matikan untuk menutup lebih awal, misalnya saat kuota
              penuh.
            </span>
          </span>
          <input
            type="checkbox"
            name="registration_open"
            checked={v.registration_open}
            onChange={(e) => set({ registration_open: e.target.checked })}
            className="peer sr-only"
          />
          <span className={switchTrack} />
        </label>
      </Card>

      <Card
        title="Klaim sertifikat"
        description="Peserta scan QR lalu mengisi nama sendiri."
        bodyClassName="space-y-5 p-5"
      >
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-semibold text-slate-700">Klaim dibuka</span>
            <span className="block text-[11px] text-slate-400">Matikan untuk menutup klaim kapan saja</span>
          </span>
          <input
            type="checkbox"
            name="is_open"
            checked={v.is_open}
            onChange={(e) => set({ is_open: e.target.checked })}
            className="peer sr-only"
          />
          <span className={switchTrack} />
        </label>
        <Field
          label="Batas klaim"
          htmlFor="claim_until"
          error={errors?.claim_until ?? errors?.claim_time}
          hint={`Klaim otomatis ditutup pada tanggal dan jam ini (WIB). Disarankan ${CLAIM_DAYS} hari setelah training. Kosongkan tanggal = sampai ditutup manual.`}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-2">
            <ArticleDatePicker
              id="claim_until"
              name="claim_until"
              label="Tanggal batas klaim"
              value={v.claim_until}
              onChange={(d) => {
                setClaimTouched(true);
                setV((all) => ({ ...all, claim_until: d }));
              }}
              isInvalid={Boolean(errors?.claim_until)}
            />
            <div className="relative">
              <input
                type="time"
                name="claim_time"
                aria-label="Jam batas klaim (WIB)"
                value={v.claim_time}
                disabled={!v.claim_until}
                onChange={(e) => setV((all) => ({ ...all, claim_time: e.target.value }))}
                className={`${inputClass} h-full pr-12 disabled:bg-slate-50 disabled:text-slate-400`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                WIB
              </span>
            </div>
          </div>
        </Field>
      </Card>
    </form>
  );
}
