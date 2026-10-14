"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { ArticleFormState } from "@/app/actions/articles";
import { quickCreateCategory } from "@/app/actions/categories";
import { slugify } from "@/lib/slugify";
import { toDateInputValue } from "@/lib/articleDate";
import type { KeyTopic } from "@/lib/keyTopics";
import type { GalleryImage } from "@/lib/gallery";
import { ArticleDatePicker } from "./ArticleDatePicker";
import { CategorySelect } from "./CategorySelect";
import { ContentEditorCard } from "./ContentEditorCard";
import { GalleryEditor } from "./GalleryEditor";
import { ImageUpload } from "./ImageUpload";
import { KeyTopicsEditor } from "./KeyTopicsEditor";
import { Card, Field, Icon, buttonClass, inputClass, type IconName } from "./ui";

type Category = { id: string; name: string };
type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type Lang = "en" | "id";

/** Fields that exist once per language (English + Indonesian *_id columns). */
type LocalizedFields = {
  title: string;
  excerpt: string;
  content: string;
  key_topics_title: string;
  key_topics: KeyTopic[];
  gallery_label: string;
  gallery_title: string;
};

export type ArticleFormValues = {
  slug: string;
  thumbnail_url: string | null;
  thumbnail_caption: string;
  thumbnail_caption_id: string;
  category_id: string | null;
  status: Status;
  /** "YYYY-MM-DD" */
  published_at: string;
  gallery: GalleryImage[];
  en: LocalizedFields;
  id: LocalizedFields;
};

type Props = {
  heading: string;
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  categories: Category[];
  initialValues?: ArticleFormValues;
  /** Public URL, shown as "Lihat artikel" when the saved article is published */
  viewHref?: string;
};

const EMPTY_LOCALIZED: LocalizedFields = {
  title: "",
  excerpt: "",
  content: "",
  key_topics_title: "",
  key_topics: [],
  gallery_label: "",
  gallery_title: "",
};

const LANG_TABS: { value: Lang; label: string; hint: string }[] = [
  { value: "en", label: "English", hint: "Bahasa utama · /news/..." },
  { value: "id", label: "Bahasa Indonesia", hint: "Tampil di /id/news/..." },
];

// Form errors that belong to the Indonesian tab
const ID_ERROR_KEYS = [
  "title_id",
  "excerpt_id",
  "content_id",
  "key_topics_title_id",
  "key_topics_id",
  "gallery_label_id",
  "gallery_title_id",
];

const STATUS_OPTIONS: { value: Status; label: string; hint: string; icon: IconName; active: string }[] = [
  { value: "DRAFT", label: "Draft", hint: "Belum tampil", icon: "draft", active: "border-amber-300 bg-amber-50 text-amber-700" },
  { value: "PUBLISHED", label: "Published", hint: "Tampil di web", icon: "check", active: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  { value: "ARCHIVED", label: "Archived", hint: "Disembunyikan", icon: "archive", active: "border-slate-300 bg-slate-100 text-slate-700" },
];

const STATUS_PILL: Record<Status, string> = {
  DRAFT: "bg-amber-50 text-amber-700 ring-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function ArticleForm({
  heading,
  action,
  categories: initialCategories,
  initialValues,
  viewHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // Shared between languages
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  // Auto-generate the slug from the English title only until it's edited by hand
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [thumbnail, setThumbnail] = useState(initialValues?.thumbnail_url ?? "");
  const [caption, setCaption] = useState({
    en: initialValues?.thumbnail_caption ?? "",
    id: initialValues?.thumbnail_caption_id ?? "",
  });
  const [status, setStatus] = useState<Status>(initialValues?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState(initialValues?.published_at ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? "");
  const [gallery, setGallery] = useState<GalleryImage[]>(initialValues?.gallery ?? []);

  // Per language
  const [fields, setFields] = useState<Record<Lang, LocalizedFields>>({
    en: initialValues?.en ?? EMPTY_LOCALIZED,
    id: initialValues?.id ?? EMPTY_LOCALIZED,
  });
  const [lang, setLang] = useState<Lang>("en");
  const set = (l: Lang, patch: Partial<LocalizedFields>) =>
    setFields((all) => ({ ...all, [l]: { ...all[l], ...patch } }));

  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const errors = state?.errors as Record<string, string[] | undefined> | undefined;
  const hasErrors = Boolean(state?.message || (errors && Object.keys(errors).length));
  const idHasErrors = ID_ERROR_KEYS.some((key) => errors?.[key]);
  const enHasErrors = Boolean(errors) && Object.keys(errors ?? {}).some((key) => !ID_ERROR_KEYS.includes(key));
  const idTranslated = Boolean(fields.id.content.trim() || fields.id.title.trim());

  const addCategory = async () => {
    if (!newCategory?.trim()) return;
    setAddingCategory(true);
    setCategoryError(null);
    const result = await quickCreateCategory(newCategory);
    setAddingCategory(false);
    if (!result.category) {
      setCategoryError(result.error ?? "Gagal menambah kategori.");
      return;
    }
    const created = result.category;
    setCategories((list) =>
      list.some((c) => c.id === created.id)
        ? list
        : [...list, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    setCategoryId(created.id);
    setNewCategory(null);
  };

  /** Main column for one language. Both stay mounted so both are submitted. */
  const renderLanguage = (l: Lang) => {
    const f = fields[l];
    const isEn = l === "en";
    const suffix = isEn ? "" : "_id";
    const err = (key: string) => errors?.[`${key}${suffix}`];
    const visibleTopics = f.key_topics.filter((t) => t.title.trim() || t.description.trim());
    // Indonesian preview falls back to English like the public page does
    const previewTopics = visibleTopics.length || isEn
      ? visibleTopics
      : fields.en.key_topics.filter((t) => t.title.trim() || t.description.trim());

    return (
      <div key={l} className={`min-w-0 space-y-6 ${lang === l ? "" : "hidden"}`}>
        {!isEn && (
          <div className="flex items-start gap-3 rounded-xl border border-[#C7974C]/30 bg-[#C7974C]/[0.07] px-4 py-3 text-xs leading-relaxed text-[#6f5426]">
            <Icon name="draft" className="mt-0.5 h-4 w-4" />
            <p>
              Terjemahan untuk pengunjung <strong>/id</strong>. Kolom yang dikosongkan otomatis memakai
              versi English. Slug, status, tanggal, kategori, thumbnail, dan foto galeri sama untuk
              kedua bahasa.
            </p>
          </div>
        )}

        <Card title={isEn ? "Informasi artikel" : "Informasi artikel (Indonesia)"} bodyClassName="space-y-5 p-5">
          <Field label="Judul" htmlFor={`title${suffix}`} error={err("title")}>
            <input
              id={`title${suffix}`}
              name={`title${suffix}`}
              value={f.title}
              onChange={(e) => {
                set(l, { title: e.target.value });
                if (isEn && !slugTouched) setSlug(slugify(e.target.value));
              }}
              className={`${inputClass} py-2.5 text-base font-semibold`}
              placeholder={isEn ? "Article title" : fields.en.title || "Judul artikel"}
            />
          </Field>

          {isEn && (
            <Field label="Slug (URL)" htmlFor="slug" error={errors?.slug}>
              <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-[#C7974C] focus-within:ring-4 focus-within:ring-[#C7974C]/15">
                <span className="shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  /news/
                </span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  onBlur={() => setSlug(slugify(slug))}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none"
                />
              </div>
            </Field>
          )}

          <Field
            label="Ringkasan"
            htmlFor={`excerpt${suffix}`}
            hint="Tampil di bawah judul artikel dan di kartu berita."
            error={err("excerpt")}
            aside={
              <span className={`text-[11px] ${f.excerpt.length > 500 ? "text-red-600" : "text-slate-400"}`}>
                {f.excerpt.length}/500
              </span>
            }
          >
            <textarea
              id={`excerpt${suffix}`}
              name={`excerpt${suffix}`}
              value={f.excerpt}
              onChange={(e) => set(l, { excerpt: e.target.value })}
              rows={2}
              placeholder={isEn ? "One or two sentences that summarize the article" : "Satu atau dua kalimat yang merangkum artikel"}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </Card>

        <ContentEditorCard
          name={`content${suffix}`}
          value={f.content}
          onChange={(html) => set(l, { content: html })}
          title={isEn ? "Konten" : "Konten (Indonesia)"}
          description="Tulis seperti di Word. Teks dari Word juga bisa langsung ditempel (paste)."
          error={err("content")}
          preview={{
            keyTopicsTitle: f.key_topics_title || (isEn ? "" : fields.en.key_topics_title),
            keyTopics: previewTopics,
            keyTopicsLabel: isEn ? "KEY TOPICS" : "TOPIK UTAMA",
            galleryLabel: f.gallery_label || (isEn ? "" : fields.en.gallery_label),
            galleryTitle: f.gallery_title || (isEn ? "" : fields.en.gallery_title),
            gallery,
          }}
        />

        <Card
          title={isEn ? "Key Topics" : "Key Topics (Indonesia)"}
          description={
            isEn
              ? "Kotak ringkasan di samping konten. Kosongkan semua poin untuk menyembunyikannya."
              : "Kosongkan untuk memakai Key Topics versi English."
          }
          actions={
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {visibleTopics.length} poin
            </span>
          }
        >
          <KeyTopicsEditor
            title={f.key_topics_title}
            topics={f.key_topics}
            onTitleChange={(v) => set(l, { key_topics_title: v })}
            onTopicsChange={(update) =>
              setFields((all) => ({ ...all, [l]: { ...all[l], key_topics: update(all[l].key_topics) } }))
            }
            titleError={err("key_topics_title")}
            nameSuffix={suffix}
          />
        </Card>

        <Card
          title={isEn ? "Galeri" : "Galeri (Indonesia)"}
          description={
            isEn
              ? "Foto dokumentasi di bawah artikel. Kosongkan foto untuk menyembunyikannya."
              : "Hanya teks label & judul. Foto galeri diatur di tab English."
          }
          actions={
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {gallery.length} foto
            </span>
          }
        >
          <GalleryEditor
            label={f.gallery_label}
            title={f.gallery_title}
            images={gallery}
            onLabelChange={(v) => set(l, { gallery_label: v })}
            onTitleChange={(v) => set(l, { gallery_title: v })}
            onImagesChange={setGallery}
            nameSuffix={suffix}
            textOnly={!isEn}
          />
          {isEn && errors?.gallery && (
            <p className="mt-3 text-xs font-medium text-red-600">{errors.gallery[0]}</p>
          )}
        </Card>
      </div>
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Sticky action bar */}
      <div className="sticky top-[57px] z-20 -mx-4 -mt-6 border-b border-slate-200/70 bg-[#f5f6f8]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:-mt-8 lg:px-10 lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/articles"
              aria-label="Kembali ke semua artikel"
              className={buttonClass("secondary", "icon")}
            >
              <Icon name="back" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400">Semua artikel</p>
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-[#0f1932]">
                  {heading}
                </h1>
                <span
                  className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 sm:inline ${STATUS_PILL[status]}`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {viewHref && (
              <Link href={viewHref} target="_blank" className={buttonClass("secondary")}>
                <Icon name="eye" />
                <span className="hidden sm:inline">Lihat artikel</span>
              </Link>
            )}
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
          {/* Language tabs */}
          <div role="tablist" aria-label="Bahasa artikel" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-[0_1px_2px_rgba(15,25,50,0.04)]">
            {LANG_TABS.map((t) => {
              const active = lang === t.value;
              const tabErrors = t.value === "id" ? idHasErrors : enHasErrors;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setLang(t.value)}
                  className={`flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left transition ${
                    active ? "bg-[#0f1932] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          active ? "bg-[#C7974C] text-[#0b1329]" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.value}
                      </span>
                      {t.label}
                    </span>
                    <span className={`block truncate text-[11px] ${active ? "text-slate-300" : "text-slate-400"}`}>
                      {t.hint}
                    </span>
                  </span>
                  {tabErrors ? (
                    <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Periksa
                    </span>
                  ) : t.value === "id" ? (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        idTranslated ? "bg-emerald-100 text-emerald-700" : active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {idTranslated ? "Terisi" : "Belum"}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {renderLanguage("en")}
          {renderLanguage("id")}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <Card title="Publikasi" bodyClassName="space-y-5 p-5">
            <fieldset className="space-y-1.5">
              <legend className="pb-1.5 text-xs font-semibold text-slate-700">Status</legend>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const checked = status === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition ${
                        checked ? option.active : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={checked}
                        onChange={() => setStatus(option.value)}
                        className="sr-only"
                      />
                      <Icon name={option.icon} />
                      <span className="text-xs font-bold">{option.label}</span>
                      <span className="text-[10px] leading-tight opacity-75">{option.hint}</span>
                    </label>
                  );
                })}
              </div>
              {errors?.status && (
                <p className="text-xs font-medium text-red-600">{errors.status[0]}</p>
              )}
            </fieldset>

            <Field
              label="Tanggal artikel"
              htmlFor="published_at"
              error={errors?.published_at}
              hint={
                publishedAt
                  ? "Tampil di artikel & kartu berita, juga menentukan urutan."
                  : "Kosongkan untuk memakai tanggal saat dipublish."
              }
              aside={
                <span className="flex items-center gap-3">
                  {publishedAt && (
                    <button
                      type="button"
                      onClick={() => setPublishedAt("")}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline"
                    >
                      Kosongkan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPublishedAt(toDateInputValue(new Date()))}
                    className="text-xs font-semibold text-[#9c7d42] hover:underline"
                  >
                    Hari ini
                  </button>
                </span>
              }
            >
              <ArticleDatePicker
                id="published_at"
                label="Tanggal artikel"
                value={publishedAt}
                onChange={setPublishedAt}
                isInvalid={Boolean(errors?.published_at)}
              />
            </Field>

            <Field
              label="Kategori"
              htmlFor="category_id"
              error={categoryError ?? undefined}
              aside={
                newCategory === null && (
                  <button
                    type="button"
                    onClick={() => setNewCategory("")}
                    className="text-xs font-semibold text-[#9c7d42] hover:underline"
                  >
                    + Baru
                  </button>
                )
              }
            >
              <CategorySelect
                id="category_id"
                label="Kategori"
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
              />
              {newCategory !== null && (
                <div className="flex gap-1.5 pt-1">
                  <input
                    autoFocus
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                      if (e.key === "Escape") setNewCategory(null);
                    }}
                    placeholder="Nama kategori baru"
                    className={`${inputClass} min-w-0 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    disabled={addingCategory}
                    className={buttonClass("primary", "sm") + " h-auto"}
                  >
                    {addingCategory ? "..." : "Tambah"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory(null);
                      setCategoryError(null);
                    }}
                    aria-label="Batal"
                    className={buttonClass("ghost", "icon") + " h-auto"}
                  >
                    <Icon name="x" />
                  </button>
                </div>
              )}
            </Field>
          </Card>

          <Card title="Thumbnail" description="Juga dipakai sebagai foto header artikel.">
            <ImageUpload
              name="thumbnail_url"
              value={thumbnail}
              onChange={setThumbnail}
              error={errors?.thumbnail_url?.[0]}
            />
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-semibold text-slate-700">Keterangan foto</p>
                <p className="text-[11px] text-slate-400">
                  Tampil di bawah foto header artikel. Opsional.
                </p>
              </div>
              {(
                [
                  { lang: "en", name: "thumbnail_caption", placeholder: "e.g. Participants of the food safety training" },
                  { lang: "id", name: "thumbnail_caption_id", placeholder: "mis. Peserta pelatihan food safety" },
                ] as const
              ).map((c) => (
                <Field key={c.lang} label={c.lang.toUpperCase()} htmlFor={c.name} error={errors?.[c.name]}>
                  <input
                    id={c.name}
                    name={c.name}
                    value={caption[c.lang]}
                    onChange={(e) => setCaption((all) => ({ ...all, [c.lang]: e.target.value }))}
                    maxLength={255}
                    placeholder={c.placeholder}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
