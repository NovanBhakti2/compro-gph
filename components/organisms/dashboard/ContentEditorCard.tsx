"use client";

import { useRef, useState } from "react";
import type { KeyTopic } from "@/lib/keyTopics";
import type { GalleryImage } from "@/lib/gallery";
import { GallerySection } from "@/components/molecules/GallerySection";
import { KeyTopicsBox } from "@/components/molecules/KeyTopicsBox";
import { RichTextEditor } from "./RichTextEditor";
import { uploadImage } from "./uploadImage";
import { Card, Icon, buttonClass } from "./ui";

// Snippets inserted at the cursor by the HTML toolbar. "$" marks the selected text.
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

type Props = {
  /** Form field name for the HTML (e.g. "content", "content_id") */
  name: string;
  value: string;
  onChange: (html: string) => void;
  title: string;
  description: string;
  error?: string[];
  /** Same extras the public page shows, for the Preview tab */
  preview: {
    keyTopicsTitle: string;
    keyTopics: KeyTopic[];
    keyTopicsLabel?: string;
    galleryLabel: string;
    galleryTitle: string;
    gallery: GalleryImage[];
  };
};

export function ContentEditorCard({ name, value, onChange, title, description, error, preview }: Props) {
  const [tab, setTab] = useState<"visual" | "html" | "preview">(() =>
    hasCustomMarkup(value) ? "html" : "visual"
  );
  const customMarkup = hasCustomMarkup(value);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertSnippet = (html: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const snippet = html.replace("$", value.slice(start, end));
    onChange(value.slice(0, start) + snippet + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    });
  };

  const insertUploadedImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      insertSnippet(`<img src="${url}" alt="$" class="rounded-2xl my-6 w-full" />`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card
      title={title}
      description={description}
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
        <RichTextEditor value={value} onChange={onChange} onUploadImage={uploadImage} />
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
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`${buttonClass("gold", "sm")} ml-auto`}
            >
              <Icon name="image" className="h-3.5 w-3.5" />
              {uploading ? "Mengupload..." : "Upload gambar"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => insertUploadedImage(e.target.files?.[0])}
            />
          </div>
          <textarea
            id={name}
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={20}
            spellCheck={false}
            aria-label={`${title} (HTML)`}
            className="block w-full resize-y bg-white px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-800 outline-none"
            placeholder="<p>Tulis konten artikel di sini...</p>"
          />
        </>
      ) : (
        <div className="min-h-[420px] bg-[#f8fafc] p-6">
          <div
            className={
              preview.keyTopics.length ? "grid grid-cols-1 items-start gap-8 xl:grid-cols-12" : undefined
            }
          >
            <div className={preview.keyTopics.length ? "xl:col-span-7" : undefined}>
              {value.trim() ? (
                <div className="article-content" dangerouslySetInnerHTML={{ __html: value }} />
              ) : (
                <p className="text-sm text-slate-400">Belum ada konten.</p>
              )}
            </div>
            {preview.keyTopics.length > 0 && (
              <div className="xl:col-span-5">
                <KeyTopicsBox
                  title={preview.keyTopicsTitle}
                  topics={preview.keyTopics}
                  label={preview.keyTopicsLabel}
                />
              </div>
            )}
          </div>
          {preview.gallery.length > 0 && (
            <div className="mt-10">
              <GallerySection
                label={preview.galleryLabel}
                title={preview.galleryTitle}
                images={preview.gallery}
              />
            </div>
          )}
        </div>
      )}
      {/* The editors unmount when switching tabs, so submit the value from state */}
      <input type="hidden" name={name} value={value} />
      {error && (
        <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs font-medium text-red-600">
          {error[0]}
        </p>
      )}
    </Card>
  );
}
