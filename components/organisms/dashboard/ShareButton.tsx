"use client";

import { useState } from "react";
import { Icon, buttonClass } from "./ui";

export function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/news/${slug}`;

    // Native share sheet on mobile (WhatsApp, dll.), copy link on desktop
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="relative">
      <button
        type="button"
        onClick={share}
        title="Salin link artikel"
        aria-label="Share"
        className={`${buttonClass("ghost", "icon")} ${copied ? "text-emerald-600" : ""}`}
      >
        <Icon name={copied ? "check" : "share"} />
      </button>
      {copied && (
        <span
          role="status"
          className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0f1932] px-2 py-1 text-[11px] font-semibold text-white shadow"
        >
          Link disalin!
        </span>
      )}
    </span>
  );
}
