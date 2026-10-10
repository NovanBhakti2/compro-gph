import type { KeyTopic } from "@/lib/keyTopics";

type Props = { title?: string | null; topics: KeyTopic[] };

export function KeyTopicsBox({ title, topics }: Props) {
  return (
    <div className="bg-[#0b1329] text-white p-8 rounded-3xl space-y-6 shadow-lg border border-slate-800">
      <div>
        <span className="text-[10px] font-bold tracking-widest text-[#C7974C] uppercase">
          KEY TOPICS
        </span>
        {title && (
          <h3 className="text-2xl font-bold mt-1 text-white leading-snug">{title}</h3>
        )}
      </div>

      <div className="space-y-6 border-t border-slate-800/80 pt-6">
        {topics.map((topic, i) => (
          <div key={i} className="space-y-1.5">
            <h4 className="font-bold text-white text-base">{topic.title}</h4>
            {topic.description && (
              <p className="text-xs text-slate-300 leading-relaxed">{topic.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
