"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export type PromoSlide = {
  imageUrl: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

type Props = {
  slides: PromoSlide[];
  /** Slide to open on */
  startIndex?: number;
  imageAlt: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
  onClose: () => void;
  /** Called when the CTA is clicked (before navigating) */
  onCta?: () => void;
};

const SWIPE_PX = 60;

/**
 * Centered flyer popup. Closes with ×, Esc, or a click on the backdrop. With
 * several flyers it becomes a slider: arrows, dots, ←/→ keys and swipe. It
 * never advances by itself, flyers take a while to read.
 */
export function PromoDialog({
  slides,
  startIndex = 0,
  imageAlt,
  closeLabel,
  prevLabel,
  nextLabel,
  onClose,
  onCta,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = slides.length;
  const multi = count > 1;
  const [[index, direction], setSlide] = useState<[number, number]>([
    Math.min(Math.max(startIndex, 0), count - 1),
    0,
  ]);

  const go = useCallback(
    (step: number) => setSlide(([i]) => [(i + step + count) % count, step]),
    [count]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (multi && e.key === "ArrowLeft") go(-1);
      else if (multi && e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    // Keep the page from scrolling behind the popup
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, go, multi]);

  const slide = slides[index];
  if (!slide) return null;
  const hasCta = Boolean(slide.ctaLabel && slide.ctaUrl);
  const anyCta = slides.some((s) => s.ctaLabel && s.ctaUrl);
  const external = Boolean(slide.ctaUrl && /^https?:\/\//.test(slide.ctaUrl));
  // One flyer: the image sizes the dialog. Several: a fixed frame, so the
  // arrows and button don't jump around between flyers of different shapes.
  const frame = multi
    ? `relative w-[min(92vw,560px)] max-h-[780px] ${anyCta ? "h-[calc(100dvh-11rem)]" : "h-[calc(100dvh-7rem)]"}`
    : "relative";
  const imageClass = multi
    ? "absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.45)] active:cursor-grabbing"
    : `block w-auto max-w-[min(92vw,560px)] rounded-2xl object-contain shadow-2xl ${
        hasCta ? "max-h-[calc(100dvh-7rem)]" : "max-h-[calc(100dvh-3rem)]"
      }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-[#0b1329]/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-roledescription={multi ? "carousel" : undefined}
        aria-label={imageAlt}
        className="relative flex max-h-full flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className={frame}>
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.img
              key={index}
              src={slide.imageUrl}
              alt={multi ? `${imageAlt} ${index + 1}/${count}` : imageAlt}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              drag={multi ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_PX) go(1);
                else if (info.offset.x > SWIPE_PX) go(-1);
              }}
              draggable={false}
              className={imageClass}
            />
          </AnimatePresence>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0f1932] shadow-lg ring-1 ring-black/5 transition hover:scale-105 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C7974C]/50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {multi && (
          <div className="flex items-center gap-3">
            <ArrowButton label={prevLabel} onClick={() => go(-1)} path="M15 19l-7-7 7-7" />
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(([current]) => [i, i > current ? 1 : -1])}
                  aria-label={`${i + 1} / ${count}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-[#C7974C]" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
            <ArrowButton label={nextLabel} onClick={() => go(1)} path="M9 5l7 7-7 7" />
          </div>
        )}

        {hasCta ? (
          <a
            href={slide.ctaUrl!}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={onCta}
            className="inline-flex items-center gap-2 rounded-full bg-[#C7974C] px-6 py-3 text-sm font-bold text-[#0f1932] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#d8bd8d]"
          >
            {slide.ctaLabel}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        ) : (
          // Keeps the dots in place when only some flyers have a button
          multi && anyCta && <div className="h-11" aria-hidden />
        )}
      </motion.div>
    </div>
  );
}

function ArrowButton({ label, onClick, path }: { label: string; onClick: () => void; path: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C7974C]/50"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={path} />
      </svg>
    </button>
  );
}
