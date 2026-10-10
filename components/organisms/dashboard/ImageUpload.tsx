"use client";

import { useRef, useState } from "react";
import { uploadImage } from "./uploadImage";
import { Icon, buttonClass } from "./ui";

type Props = {
  name: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
};

export function ImageUpload({ name, value, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
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
          handleFile(e.dataTransfer.files[0]);
        }}
        disabled={uploading}
        className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-dashed transition ${
          value ? "border-transparent" : ""
        } ${
          dragging
            ? "border-[#C7974C] bg-[#C7974C]/10"
            : "border-slate-300 bg-slate-50/60 hover:border-[#C7974C] hover:bg-[#C7974C]/5"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-[#0b1329]/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Icon name="image" />
              Ganti gambar
            </span>
          </>
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
            <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
              <Icon name="image" className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Klik atau seret gambar ke sini
            </span>
            <span className="text-[11px] text-slate-400">JPG, PNG, WEBP, GIF. Maks 4 MB</span>
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-semibold text-slate-600">
            Mengupload...
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-2">
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="atau tempel URL gambar"
          className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#C7974C] focus:ring-4 focus:ring-[#C7974C]/15"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            title="Hapus gambar"
            aria-label="Hapus gambar"
            className={`${buttonClass("ghost", "icon")} hover:bg-red-50 hover:text-red-600`}
          >
            <Icon name="trash" />
          </button>
        )}
      </div>

      {(uploadError || error) && (
        <p className="text-xs text-red-600">{uploadError ?? error}</p>
      )}
    </div>
  );
}
