"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import type { ArticleFormState } from "@/app/actions/articles";
import { quickCreateCategory } from "@/app/actions/categories";
import { slugify } from "@/lib/slugify";
import { toDateInputValue } from "@/lib/articleDate";
import type { KeyTopic } from "@/lib/keyTopics";
import type { GalleryImage } from "@/lib/gallery";
import { GallerySection } from "@/components/molecules/GallerySection";
import { KeyTopicsBox } from "@/components/molecules/KeyTopicsBox";
import { GalleryEditor } from "./GalleryEditor";
import { ArticleDatePicker } from "./ArticleDatePicker";
import { CategorySelect } from "./CategorySelect";
import { ImageUpload } from "./ImageUpload";
import { KeyTopicsEditor } from "./KeyTopicsEditor";
import { RichTextEditor } from "./RichTextEditor";
import { uploadImage } from "./uploadImage";
import { Card, Field, Icon, buttonClass, inputClass, type IconName } from "./ui";

type Category = { id: string; name: string };
type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ArticleFormValues = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  category_id: string | null;
  status: Status;
  /** "YYYY-MM-DD" */
  published_at: string;
  key_topics_title: string | null;
  key_topics: KeyTopic[];
  gallery_label: string | null;
  gallery_title: string | null;
  gallery: GalleryImage[];
};

type Props = {
  heading: string;
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  categories: Category[];
  initialValues?: ArticleFormValues;
  /** Public URL, shown as "Lihat artikel" when the saved article is published */
  viewHref?: string;
};

// Snippets inserted at the cursor by the toolbar. "$" marks the selected text.
const SNIPPETS = [
  { label: "H2", html: '<h2 class="text-2xl font-extrabold text-[#0f1932] pt-4">$</h2>' },
  { label: "Paragraf", html: "<p>$</p>" },
  { label: "Bold", html: "<strong>$</strong>" },
  { label: "Italic", html: "<em>$</em>" },
  { label: "List", html: '<ul class="list-disc pl-6 space-y-1">\n  <li>$</li>\n</ul>' },
  {
    label: "Quote",
    html: '<div class="p-6 bg-white border-l-4 border-[#C7974C] rounded-r-2xl shadow-sm my-6">\n  <p class="italic font-medium text-slate-800">$</p>\n</div>',
  },
  { label: "Link", html: '<a href="https://" class="text-[#9c7d42] underline">$</a>' },
  { label: "Gambar", html: '<img src="https://" alt="$" class="rounded-2xl my-6 w-full" />' },
];

/**
 * Hand-written HTML (wrapper divs, Tailwind classes, grids) that the visual
 * editor would flatten. Such content opens in HTML mode by default.
 */
const hasCustomMarkup = (html: string) => /<(div|section|span|table)[\s>]|\sclass=/i.test(html);

const CONTENT_TABS = [
  { value: "visual", label: "Visual" },
  { value: "html", label: "HTML" },
  { value: "preview", label: "Preview" },
] as const;

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

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  // Auto-generate the slug from the title only until it's edited by hand
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? "");
  const [thumbnail, setThumbnail] = useState(initialValues?.thumbnail_url ?? "");
  const [status, setStatus] = useState<Status>(initialValues?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState(initialValues?.published_at ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [keyTopicsTitle, setKeyTopicsTitle] = useState(initialValues?.key_topics_title ?? "");
  const [keyTopics, setKeyTopics] = useState<KeyTopic[]>(initialValues?.key_topics ?? []);
  const [galleryLabel, setGalleryLabel] = useState(initialValues?.gallery_label ?? "");
  const [galleryTitle, setGalleryTitle] = useState(initialValues?.gallery_title ?? "");
  const [gallery, setGallery] = useState<GalleryImage[]>(initialValues?.gallery ?? []);
  const [tab, setTab] = useState<"visual" | "html" | "preview">(
    hasCustomMarkup(initialValues?.content ?? "") ? "html" : "visual"
  );
  const customMarkup = hasCustomMarkup(content);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const contentImageRef = useRef<HTMLInputElement>(null);
  const [contentUploading, setContentUploading] = useState(false);

  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const errors = state?.errors;
  const hasErrors = Boolean(state?.message || (errors && Object.keys(errors).length));
  const visibleTopics = keyTopics.filter((t) => t.title.trim() || t.description.trim());

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

  const insertSnippet = (html: string) => {
    const el = contentRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const snippet = html.replace("$", content.slice(start, end));
    setContent(content.slice(0, start) + snippet + content.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    });
  };

  const insertUploadedImage = async (file?: File) => {
    if (!file) return;
    setContentUploading(true);
    try {
      const url = await uploadImage(file);
      insertSnippet(`<img src="${url}" alt="$" class="rounded-2xl my-6 w-full" />`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setContentUploading(false);
      if (contentImageRef.current) contentImageRef.current.value = "";
    }
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
          <Card title="Informasi artikel" bodyClassName="space-y-5 p-5">
            <Field label="Judul" htmlFor="title" error={errors?.title}>
              <input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={`${inputClass} py-2.5 text-base font-semibold`}
                placeholder="Judul artikel"
              />
            </Field>

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

            <Field
              label="Ringkasan"
              htmlFor="excerpt"
              hint="Tampil di bawah judul artikel dan di kartu berita."
              error={errors?.excerpt}
              aside={
                <span className={`text-[11px] ${excerpt.length > 500 ? "text-red-600" : "text-slate-400"}`}>
                  {excerpt.length}/500
                </span>
              }
            >
              <textarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Satu atau dua kalimat yang merangkum artikel"
                className={`${inputClass} resize-y`}
              />
            </Field>
          </Card>

          <Card
            title="Konten"
            description="Tulis seperti di Word. Teks dari Word juga bisa langsung ditempel (paste)."
            actions={
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                {CONTENT_TABS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTab(t.value)}
                    className={`rounded-md px-3 py-1.5 transition ${
                      tab === t.value ? "bg-white text-[#0f1932] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            }
            bodyClassName=""
          >
            {tab === "visual" && customMarkup && (
              <div className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-800">
                <Icon name="draft" className="mt-0.5 h-4 w-4" />
                <p>
                  Artikel ini memakai format khusus (kotak/grid) yang dibuat lewat HTML. Mengedit di mode
                  Visual akan menyederhanakan format tersebut.{" "}
                  <button type="button" onClick={() => setTab("html")} className="font-semibold underline">
                    Edit lewat HTML saja
                  </button>
                </p>
              </div>
            )}
            {tab === "visual" ? (
              <RichTextEditor value={content} onChange={setContent} onUploadImage={uploadImage} />
            ) : tab === "html" ? (
              <>
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
                  {SNIPPETS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => insertSnippet(s.html)}
                      className="rounded-md px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white hover:shadow-sm"
                    >
                      {s.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => contentImageRef.current?.click()}
                    disabled={contentUploading}
                    className={`${buttonClass("gold", "sm")} ml-auto`}
                  >
                    <Icon name="image" className="h-3.5 w-3.5" />
                    {contentUploading ? "Mengupload..." : "Upload gambar"}
                  </button>
                  <input
                    ref={contentImageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => insertUploadedImage(e.target.files?.[0])}
                  />
                </div>
                <textarea
                  id="content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  spellCheck={false}
                  aria-label="Konten (HTML)"
                  className="block w-full resize-y bg-white px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-800 outline-none"
                  placeholder="<p>Tulis konten artikel di sini...</p>"
                />
              </>
            ) : (
              <div className="min-h-[420px] bg-[#f8fafc] p-6">
                <div
                  className={
                    visibleTopics.length ? "grid grid-cols-1 items-start gap-8 xl:grid-cols-12" : undefined
                  }
                >
                  <div className={visibleTopics.length ? "xl:col-span-7" : undefined}>
                    {content.trim() ? (
                      <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    ) : (
                      <p className="text-sm text-slate-400">Belum ada konten.</p>
                    )}
                  </div>
                  {visibleTopics.length > 0 && (
                    <div className="xl:col-span-5">
                      <KeyTopicsBox title={keyTopicsTitle} topics={visibleTopics} />
                    </div>
                  )}
                </div>
                {gallery.length > 0 && (
                  <div className="mt-10">
                    <GallerySection label={galleryLabel} title={galleryTitle} images={gallery} />
                  </div>
                )}
              </div>
            )}
            {/* The editors unmount when switching tabs, so submit the value from state */}
            <input type="hidden" name="content" value={content} />
            {errors?.content && (
              <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs font-medium text-red-600">
                {errors.content[0]}
              </p>
            )}
          </Card>

          <Card
            title="Key Topics"
            description="Kotak ringkasan di samping konten. Kosongkan semua poin untuk menyembunyikannya."
            actions={
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {visibleTopics.length} poin
              </span>
            }
          >
            <KeyTopicsEditor
              title={keyTopicsTitle}
              topics={keyTopics}
              onTitleChange={setKeyTopicsTitle}
              onTopicsChange={setKeyTopics}
              titleError={errors?.key_topics_title}
            />
          </Card>

          <Card
            title="Galeri"
            description="Foto dokumentasi di bawah artikel. Kosongkan foto untuk menyembunyikannya."
            actions={
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {gallery.length} foto
              </span>
            }
          >
            <GalleryEditor
              label={galleryLabel}
              title={galleryTitle}
              images={gallery}
              onLabelChange={setGalleryLabel}
              onTitleChange={setGalleryTitle}
              onImagesChange={setGallery}
            />
            {errors?.gallery && (
              <p className="mt-3 text-xs font-medium text-red-600">{errors.gallery[0]}</p>
            )}
          </Card>
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
          </Card>
        </aside>
      </div>
    </form>
  );
}
