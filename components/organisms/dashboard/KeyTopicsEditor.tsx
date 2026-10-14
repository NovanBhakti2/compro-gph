"use client";

import type { KeyTopic } from "@/lib/keyTopics";
import { Field, Icon, buttonClass, inputClass } from "./ui";

type Props = {
  title: string;
  topics: KeyTopic[];
  onTitleChange: (value: string) => void;
  onTopicsChange: (update: (topics: KeyTopic[]) => KeyTopic[]) => void;
  titleError?: string[];
  /** Appended to field names/ids, e.g. "_id" for the Indonesian version */
  nameSuffix?: string;
};

export function KeyTopicsEditor({
  title,
  topics,
  onTitleChange,
  onTopicsChange,
  titleError,
  nameSuffix = "",
}: Props) {
  const update = (index: number, patch: Partial<KeyTopic>) =>
    onTopicsChange((list) => list.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  const move = (index: number, delta: number) =>
    onTopicsChange((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });

  return (
    <div className="space-y-4">
      <Field label="Judul kotak" htmlFor={`key_topics_title${nameSuffix}`} error={titleError}>
        <input
          id={`key_topics_title${nameSuffix}`}
          name={`key_topics_title${nameSuffix}`}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputClass}
          placeholder="What the session reinforced"
        />
      </Field>

      {topics.length > 0 && (
        <ol className="space-y-2.5">
          {topics.map((topic, i) => (
            <li
              key={i}
              className="group flex gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors focus-within:border-[#C7974C]/50 focus-within:bg-white"
            >
              <span className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0b1329] text-[11px] font-bold text-[#C7974C]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  name={`key_topic_title${nameSuffix}`}
                  value={topic.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  aria-label={`Judul poin ${i + 1}`}
                  placeholder="Judul poin, mis. Practical awareness"
                  className={`${inputClass} font-semibold`}
                />
                <textarea
                  name={`key_topic_description${nameSuffix}`}
                  value={topic.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  aria-label={`Deskripsi poin ${i + 1}`}
                  placeholder="Deskripsi singkat"
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Pindah ke atas"
                  className={`${buttonClass("ghost", "icon")} h-7 w-7`}
                >
                  <Icon name="up" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === topics.length - 1}
                  aria-label="Pindah ke bawah"
                  className={`${buttonClass("ghost", "icon")} h-7 w-7`}
                >
                  <Icon name="down" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onTopicsChange((list) => list.filter((_, j) => j !== i))}
                  aria-label="Hapus poin"
                  className={`${buttonClass("ghost", "icon")} h-7 w-7 hover:bg-red-50 hover:text-red-600`}
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={() => onTopicsChange((list) => [...list, { title: "", description: "" }])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-[#C7974C] hover:bg-[#C7974C]/5 hover:text-[#9c7d42]"
      >
        <Icon name="plus" />
        Tambah poin
      </button>
    </div>
  );
}
