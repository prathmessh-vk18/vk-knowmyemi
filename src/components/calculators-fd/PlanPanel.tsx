import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/finance";
import { Sparkles } from "lucide-react";

const RATE_PRESETS = [
  { label: "Safe", rate: 6.5 },
  { label: "Average", rate: 7 },
  { label: "High", rate: 7.5 },
  { label: "Senior Citizen", rate: 8 },
];

function EditableValue({
  value,
  displayValue,
  onCommit,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
}: {
  value: number;
  displayValue: string;
  onCommit: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const raw = draft.replace(/[^0-9.]/g, "");
    const parsed = Number(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const stepped = Math.round(clamped / step) * step;
      onCommit(stepped);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="font-mono text-sm font-semibold text-slate-800 bg-slate-50 border border-blue-400 rounded-md px-2 w-[120px] text-right outline-none focus:ring-1 focus:ring-blue-500"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md px-2 py-0.5 transition-all cursor-text border border-blue-200 underline decoration-dotted underline-offset-2 decoration-blue-400"
    >
      {prefix}{displayValue}{suffix}
    </button>
  );
}

interface PlanPanelProps {
  amount: number;
  years: number;
  rate: number;
  onAmount: (v: number) => void;
  onYears: (v: number) => void;
  onRate: (v: number) => void;
}

export const PlanPanel = ({
  amount,
  years,
  rate,
  onAmount,
  onYears,
  onRate,
}: PlanPanelProps) => {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="bg-white rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Step 1
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Plan Your Investment
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tweak the numbers — see what happens instantly.
        </p>

        {/* Amount */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium text-slate-700">
              How much are you investing?
            </Label>
            <EditableValue
              value={amount}
              displayValue={formatINR(amount)}
              onCommit={onAmount}
              min={10000}
              max={5000000}
              step={5000}
            />
          </div>
          <Slider
            value={[amount]}
            min={10000}
            max={5000000}
            step={5000}
            onValueChange={(v) => onAmount(v[0])}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
            <span>₹10K</span>
            <span>₹50L</span>
          </div>
        </div>

        {/* Years */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium text-slate-700">
              For how many years?
            </Label>
            <EditableValue
              value={years}
              displayValue={`${years} ${years === 1 ? 'year' : 'years'}`}
              onCommit={onYears}
              min={1}
              max={10}
              step={1}
            />
          </div>
          <Slider
            value={[years]}
            min={1}
            max={10}
            step={1}
            onValueChange={(v) => onYears(v[0])}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
            <span>1 yr</span>
            <span>10 yrs</span>
          </div>
        </div>

        {/* Rate */}
        <div className="mt-8">
          <Label className="text-sm font-medium text-slate-700">
            Pick an interest rate
          </Label>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {RATE_PRESETS.map((p) => {
              const active = Math.abs(rate - p.rate) < 0.01;
              return (
                <button
                  key={p.label}
                  onClick={() => onRate(p.rate)}
                  className={cn(
                    "group relative rounded-xl border px-3 py-3 text-left transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-sm",
                    active
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-400/50",
                  )}
                >
                  <div className="text-xs text-slate-500 font-medium">{p.label}</div>
                  <div
                    className={cn(
                      "text-base font-bold mt-0.5",
                      active ? "text-blue-600" : "text-slate-900",
                    )}
                  >
                    {p.rate}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
};
