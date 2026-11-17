"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { Label, ListBox, Select } from "@heroui/react";
import type { PromoFormState } from "@/app/actions/promos";
import type { PromoTrainingOption } from "@/lib/promos";
import { PromoDialog } from "@/components/molecules/PromoDialog";
import { toDateInputValue } from "@/lib/articleDate";
import { ArticleDatePicker } from "./ArticleDatePicker";
import { ImageUpload } from "./ImageUpload";
import { Card, Field, Icon, buttonClass, inputClass } from "./ui";

export type PromoFormValues = {
  title: string;
  image_url: string;
  image_url_id: string;
  cta_label: string;
  cta_label_id: string;
  cta_url: string;
  /** "YYYY-MM-DD" */
  starts_at: string;
  ends_at: string;
  show_on: "HOME" | "ALL";
  show_popup: boolean;
  show_in_news: boolean;
  is_active: boolean;
  /** "" = the button uses cta_url */
  training_id: string;
};

type Props = {
  heading: string;
  action: (state: PromoFormState, formData: FormData) => Promise<PromoFormState>;
  initialValues?: PromoFormValues;
  trainings: PromoTrainingOption[];
};

const EMPTY: PromoFormValues = {
  title: "",
  image_url: "",
  image_url_id: "",
  cta_label: "",
  cta_label_id: "",
  cta_url: "",
  starts_at: "",
  ends_at: "",
  show_on: "HOME",
  show_popup: true,
  show_in_news: true,
  is_active: true,
  training_id: "",
};

const switchClass =
  "relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-4 peer-focus-visible:ring-[#C7974C]/30 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5";

export function PromoForm({ heading, action, initialValues, trainings }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [v, setV] = useState<PromoFormValues>(initialValues ?? EMPTY);
  const set = (patch: Partial<PromoFormValues>) => setV((all) => ({ ...all, ...patch }));
  const [preview, setPreview] = useState<"en" | "id" | null>(null);
  // Button target: a training's sign-up form (default when there are trainings) or any link
  const [target, setTarget] = useState<"training" | "link">(
    v.training_id || (!initialValues && trainings.some((t) => t.open)) ? "training" : "link"
  );
  const linkedTraining = target === "training" ? v.training_id : "";
  const previewUrl = linkedTraining ? "/register" : v.cta_url;

  const errors = state?.errors;
  const hasErrors = Boolean(state?.message || (errors && Object.keys(errors).length));
  const today = toDateInputValue(new Date());
  const scheduleNote = !v.is_active
    ? "Nonaktif: promo tidak akan tampil."
    : v.ends_at && v.ends_at < today
      ? "Periode sudah lewat: promo tidak akan tampil."
      : v.starts_at && v.starts_at > today
        ? `Terjadwal: mulai tampil ${v.starts_at}.`
        : "Akan tampil sekarang setelah disimpan.";

  return (
    <form
      // Submitted by hand: `action={formAction}` resets the form after a failed
      // save, which flips the switches back while the state keeps the old values
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-6"
    >
      {/* Sticky action bar */}
      <div className="sticky top-[57px] z-20 -mx-4 -mt-6 border-b border-slate-200/70 bg-[#f5f6f8]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:-mt-8 lg:px-10 lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard/promos" aria-label="Kembali" className={buttonClass("secondary", "icon")}>
              <Icon name="back" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400">Pop-up Promo</p>
              <h1 className="truncate text-lg font-extrabold tracking-tight text-[#0f1932]">{heading}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!v.image_url}
              onClick={() => setPreview("en")}
              className={buttonClass("secondary")}
            >
              <Icon name="eye" />
              <span className="hidden sm:inline">Pratinjau</span>
            </button>
            <button type="submit" disabled={pending} className={buttonClass("primary")}>
              <Icon name="check" />
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {hasErrors && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icon name="x" className="mt-0.5 h-4 w-4" />
          <p>{state?.message ?? "Belum bisa disimpan. Periksa kembali isian yang ditandai merah."}</p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card title="Nama promo" description="Hanya untuk dashboard, tidak tampil ke pengunjung.">
            <Field label="Nama" htmlFor="title" error={errors?.title}>
              <input
                id="title"
                name="title"
                value={v.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="mis. Food Handler Training — September"
                className={inputClass}
              />
            </Field>
          </Card>

          <Card
            title="Gambar flyer"
            description="Disarankan rasio potret (4:5 atau 2:3), lebar minimal 1000px, maks 4 MB. Kompres dulu kalau terlalu besar."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  English <span className="font-normal text-slate-400">(wajib)</span>
                </p>
                <ImageUpload
                  name="image_url"
                  value={v.image_url}
                  onChange={(url) => set({ image_url: url })}
                  error={errors?.image_url?.[0]}
                  variant="flyer"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Bahasa Indonesia{" "}
                  <span className="font-normal text-slate-400">(opsional, kosong = pakai English)</span>
                </p>
                <ImageUpload
                  name="image_url_id"
                  value={v.image_url_id}
                  onChange={(url) => set({ image_url_id: url })}
                  error={errors?.image_url_id?.[0]}
                  variant="flyer"
                />
              </div>
            </div>
          </Card>

          <Card
            title="Tombol aksi"
            description="Tombol di bawah flyer: ke form pendaftaran training, atau link lain seperti WhatsApp."
            bodyClassName="space-y-4 p-5"
          >
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Tujuan tombol">
              {(
                [
                  ["training", "Pendaftaran training"],
                  ["link", "Link lain / tanpa tombol"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={target === key}
                  onClick={() => setTarget(key)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    target === key ? "bg-white text-[#0f1932] shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input type="hidden" name="training_id" value={linkedTraining} />

            {target === "training" && (
              <Field
                label="Training"
                htmlFor="promo_training"
                error={errors?.training_id}
                hint="Tombol membuka form pendaftaran dengan training ini sudah terpilih. Teks tombol kosong = “Daftar sekarang” / “Register now”."
              >
                {trainings.length === 0 ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Belum ada training yang pendaftarannya dibuka.{" "}
                    <Link href="/dashboard/trainings/new" className="font-semibold underline">
                      Buat training
                    </Link>{" "}
                    dulu.
                  </p>
                ) : (
                  <Select
                    id="promo_training"
                    className="w-full"
                    placeholder="Pilih training"
                    value={v.training_id || null}
                    onChange={(key) => set({ training_id: key ? String(key) : "" })}
                  >
                    <Label className="sr-only">Training</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {trainings.map((t) => (
                          <ListBox.Item key={t.id} id={t.id} textValue={t.label}>
                            <span>
                              {t.label}
                              {!t.open && <span className="ml-2 text-xs text-red-500">pendaftaran ditutup</span>}
                            </span>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teks tombol (EN)" htmlFor="cta_label" error={errors?.cta_label}>
                <input
                  id="cta_label"
                  name="cta_label"
                  value={v.cta_label}
                  onChange={(e) => set({ cta_label: e.target.value })}
                  placeholder="Register now"
                  className={inputClass}
                />
              </Field>
              <Field label="Teks tombol (ID)" htmlFor="cta_label_id" error={errors?.cta_label_id}>
                <input
                  id="cta_label_id"
                  name="cta_label_id"
                  value={v.cta_label_id}
                  onChange={(e) => set({ cta_label_id: e.target.value })}
                  placeholder="Daftar sekarang"
                  className={inputClass}
                />
              </Field>
            </div>
            {target === "link" && (
            <Field
              label="Link tujuan"
              htmlFor="cta_url"
              error={errors?.cta_url}
              hint="Contoh: https://bit.ly/FoodHandlerGPH atau https://wa.me/6281289556334"
            >
              <input
                id="cta_url"
                name="cta_url"
                value={v.cta_url}
                onChange={(e) => set({ cta_url: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>
            )}
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <Card title="Penayangan" bodyClassName="space-y-5 p-5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold text-slate-700">Aktif</span>
                <span className="block text-[11px] text-slate-400">Matikan untuk menyembunyikan</span>
              </span>
              <input
                type="checkbox"
                name="is_active"
                checked={v.is_active}
                onChange={(e) => set({ is_active: e.target.checked })}
                className="peer sr-only"
              />
              <span className={switchClass} />
            </label>

            <Field
              label="Mulai tampil"
              htmlFor="starts_at"
              error={errors?.starts_at}
              hint="Kosong = langsung tampil."
            >
              <ArticleDatePicker
                id="starts_at"
                name="starts_at"
                label="Mulai tampil"
                value={v.starts_at}
                onChange={(d) => set({ starts_at: d })}
                isInvalid={Boolean(errors?.starts_at)}
              />
            </Field>
            <Field
              label="Selesai tampil"
              htmlFor="ends_at"
              error={errors?.ends_at}
              hint="Kosong = tampil terus. Biasanya diisi tanggal acara."
            >
              <ArticleDatePicker
                id="ends_at"
                name="ends_at"
                label="Selesai tampil"
                value={v.ends_at}
                onChange={(d) => set({ ends_at: d })}
                isInvalid={Boolean(errors?.ends_at)}
              />
            </Field>

            <fieldset className="space-y-3">
              <legend className="pb-1.5 text-xs font-semibold text-slate-700">Tampil di</legend>
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold text-slate-700">Pop-up</span>
                  <span className="block text-[11px] text-slate-400">Muncul 3 detik setelah halaman dibuka</span>
                </span>
                <input
                  type="checkbox"
                  name="show_popup"
                  checked={v.show_popup}
                  onChange={(e) => set({ show_popup: e.target.checked })}
                  className="peer sr-only"
                />
                <span className={switchClass} />
              </label>
              {/* Keeps show_on submitted while its choices are hidden */}
              {!v.show_popup && <input type="hidden" name="show_on" value={v.show_on} />}
              <div className={`grid grid-cols-2 gap-2 ${v.show_popup ? "" : "hidden"}`}>
                {(
                  [
                    { value: "HOME", label: "Beranda", hint: "Disarankan" },
                    { value: "ALL", label: "Semua halaman", hint: "Termasuk berita" },
                  ] as const
                ).map((o) => (
                  <label
                    key={o.value}
                    className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center transition ${
                      v.show_on === o.value
                        ? "border-[#0f1932] bg-[#0f1932]/[0.04] ring-1 ring-[#0f1932]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={v.show_popup ? "show_on" : undefined}
                      value={o.value}
                      checked={v.show_on === o.value}
                      onChange={() => set({ show_on: o.value })}
                      className="sr-only"
                    />
                    <span className="block text-xs font-bold text-[#0f1932]">{o.label}</span>
                    <span className="block text-[10px] text-slate-400">{o.hint}</span>
                  </label>
                ))}
              </div>
              <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span>
                  <span className="block text-sm font-semibold text-slate-700">Section News</span>
                  <span className="block text-[11px] text-slate-400">&quot;Program &amp; Pelatihan&quot; di halaman News</span>
                </span>
                <input
                  type="checkbox"
                  name="show_in_news"
                  checked={v.show_in_news}
                  onChange={(e) => set({ show_in_news: e.target.checked })}
                  className="peer sr-only"
                />
                <span className={switchClass} />
              </label>
              {errors?.placement && <p className="text-xs font-medium text-red-600">{errors.placement[0]}</p>}
            </fieldset>

            <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
              {scheduleNote}
              {v.show_popup && " Pop-up muncul sekali per sesi browser."}
            </p>
          </Card>

          {v.image_url && (
            <Card title="Pratinjau" bodyClassName="flex gap-2 p-4">
              <button type="button" onClick={() => setPreview("en")} className={`${buttonClass("secondary", "sm")} flex-1`}>
                English
              </button>
              <button type="button" onClick={() => setPreview("id")} className={`${buttonClass("secondary", "sm")} flex-1`}>
                Indonesia
              </button>
            </Card>
          )}
        </aside>
      </div>

      {preview && v.image_url && (
        <PromoDialog
          slides={[
            {
              imageUrl: (preview === "id" && v.image_url_id) || v.image_url,
              ctaLabel:
                (preview === "id" && v.cta_label_id) ||
                v.cta_label ||
                (linkedTraining ? (preview === "id" ? "Daftar sekarang" : "Register now") : ""),
              ctaUrl: previewUrl,
            },
          ]}
          imageAlt="Pratinjau flyer"
          closeLabel="Tutup pratinjau"
          prevLabel="Sebelumnya"
          nextLabel="Berikutnya"
          onClose={() => setPreview(null)}
        />
      )}
    </form>
  );
}
