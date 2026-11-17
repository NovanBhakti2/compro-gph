import type { ClaimStatus } from "@/lib/certificates";

const STATUS: Record<ClaimStatus, { label: string; className: string }> = {
  OPEN: { label: "Klaim dibuka", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  EXPIRED: { label: "Masa klaim habis", className: "bg-slate-100 text-slate-500 ring-slate-200" },
  CLOSED: { label: "Klaim ditutup", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

export function TrainingStatusBadge({ status }: { status: ClaimStatus }) {
  const s = STATUS[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${s.className}`}>{s.label}</span>;
}
