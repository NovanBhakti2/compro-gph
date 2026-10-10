"use client";

import { useRef, useState } from "react";
import type { GalleryImage } from "@/lib/gallery";
import { uploadImage } from "./uploadImage";
import { Field, Icon, inputClass } from "./ui";

type Props = {
  label: string;
  title: string;
  images: GalleryImage[];
  onLabelChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onImagesChange: (update: (images: GalleryImage[]) => GalleryImage[]) => void;
};

const overlayButton =
  "flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-slate-600 shadow-sm hover:bg-white";

export function GalleryEditor({
  label,
  title,
  images,
  onLabelChange,
  onTitleChange,
  onImagesChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    setErrors([]);
    setUploading({ done: 0, total: files.length });

    // One by one to stay under the per-request size limit
    for (const [i, file] of files.entries()) {
      try {
        const url = await uploadImage(file);
        onImagesChange((list) => [...list, { url, alt: "" }]);
      } catch (e) {
        setErrors((list) => [...list, `${file.name}: ${(e as Error).message}`]);
      }
      setUploading({ done: i + 1, total: files.length });
    }

    setUploading(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (index: number, delta: number) =>
    onImagesChange((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label kecil" htmlFor="gallery_label">
          <input
            id="gallery_label"
            name="gallery_label"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="INSIDE THE WORKSHOP"
            className={inputClass}
          />
        </Field>
        <Field label="Judul galeri" htmlFor="gallery_title">
          <input
            id="gallery_title"
            name="gallery_title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Learning together in Bali"
            className={inputClass}
          />
        </Field>
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, i) => (
            <li
              key={`${image.url}-${i}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#0b1329]/90 px-1.5 text-[11px] font-bold text-[#e0b673]">
                  {i + 1}
                </span>
                <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  {i > 0 && (
                    <button type="button" onClick={() => move(i, -1)} aria-label="Geser ke kiri" className={overlayButton}>
                      <Icon name="left" className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => move(i, 1)} aria-label="Geser ke kanan" className={overlayButton}>
                      <Icon name="right" className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onImagesChange((list) => list.filter((_, j) => j !== i))}
                    aria-label="Hapus foto"
                    className={`${overlayButton} text-red-600`}
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <input type="hidden" name="gallery_url" value={image.url} />
              <input
                name="gallery_alt"
                value={image.alt}
                onChange={(e) =>
                  onImagesChange((list) =>
                    list.map((img, j) => (j === i ? { ...img, alt: e.target.value } : img))
                  )
                }
                aria-label={`Keterangan foto ${i + 1}`}
                placeholder="Keterangan foto"
                className="w-full border-t border-slate-100 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:bg-[#C7974C]/5"
              />
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(Array.from(e.dataTransfer.files));
        }}
        disabled={uploading !== null}
        className={`flex w-full flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-5 transition disabled:opacity-70 ${
          dragging
            ? "border-[#C7974C] bg-[#C7974C]/10"
            : "border-slate-300 hover:border-[#C7974C] hover:bg-[#C7974C]/5"
        }`}
      >
        <Icon name="image" className="h-5 w-5 text-slate-400" />
        <span className="text-sm font-semibold text-slate-600">
          {uploading
            ? `Mengupload ${Math.min(uploading.done + 1, uploading.total)} dari ${uploading.total}...`
            : "Tambah foto"}
        </span>
        {!uploading && (
          <span className="text-[11px] text-slate-400">
            Pilih beberapa sekaligus atau seret ke sini &middot; maks 4 MB per foto
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
      />

      {errors.length > 0 && (
        <ul className="space-y-0.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
