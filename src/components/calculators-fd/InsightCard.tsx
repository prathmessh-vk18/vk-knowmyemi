import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: "growth" | "neutral" | "warn";
}

export const InsightCard = ({ label, value, hint, tone = "neutral" }: Props) => {
  const valueClass = {
    growth: "text-emerald-600",
    neutral: "text-blue-600",
    warn: "text-amber-500",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-0.5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn("text-2xl font-black tracking-tight mt-1", valueClass)}>{value}</p>
      {hint && <p className="text-xs font-medium text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
};
