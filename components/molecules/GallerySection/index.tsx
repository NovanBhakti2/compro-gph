import type { GalleryImage } from "@/lib/gallery";

type Props = {
  label?: string | null;
  title?: string | null;
  images: GalleryImage[];
};

export function GallerySection({ label, title, images }: Props) {
  return (
    <div className="pt-10 border-t border-slate-200/80 space-y-4">
      {(label || title) && (
        <div className="space-y-1">
          {label && (
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {label}
            </span>
          )}
          {title && <h3 className="text-2xl font-extrabold text-[#0f1932]">{title}</h3>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {images.map((image, i) => (
          <div
            key={`${image.url}-${i}`}
            className="h-44 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 shadow-2xs"
          >
            <img
              src={image.url}
              alt={image.alt || title || ""}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
