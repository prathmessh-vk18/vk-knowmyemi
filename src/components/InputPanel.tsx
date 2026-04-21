import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CURRENCIES, LOAN_TYPES, type LoanInput } from "@/lib/loan-calculations";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Car, User, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function EditableValue({
  value,
  displayValue,
  onCommit,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  parseValue,
}: {
  value: number;
  displayValue: string;
  onCommit: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  parseValue?: (raw: string) => number;
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
    const parsed = parseValue ? parseValue(raw) : Number(raw);
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
        className="font-mono text-sm font-semibold text-foreground bg-secondary border border-primary/30 rounded-md px-2 py-0.5 w-[120px] text-right outline-none focus:ring-1 focus:ring-primary"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="font-mono text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md px-2 py-0.5 transition-all cursor-text border border-primary/30 hover:border-primary/50 underline decoration-dotted underline-offset-2 decoration-primary/40"
      title="Click to type a value"
    >
      {prefix}{displayValue}{suffix}
    </button>
  );
}

const LOAN_DEFAULTS: Record<string, { principal: number; annualRate: number; tenureYears: number }> = {
  "Home Loan": { principal: 2500000, annualRate: 8.5, tenureYears: 20 },
  "Car Loan": { principal: 700000, annualRate: 9.0, tenureYears: 5 },
  "Personal Loan": { principal: 300000, annualRate: 12.0, tenureYears: 3 },
  "Other": { principal: 1000000, annualRate: 13.0, tenureYears: 5 },
};

const loanIcons: Record<string, React.ReactNode> = {
  "Home Loan": <Home className="h-4 w-4" />,
  "Car Loan": <Car className="h-4 w-4" />,
  "Personal Loan": <User className="h-4 w-4" />,
  "Other": <Layers className="h-4 w-4" />,
};

interface InputPanelProps {
  input: LoanInput;
  updateInput: (p: Partial<LoanInput>) => void;
  currency: (typeof CURRENCIES)[number];
  setCurrency: (c: (typeof CURRENCIES)[number]) => void;
  loanType: string;
  setLoanType: (t: string) => void;
  isCalculated?: boolean;
  onCalculate?: () => void;
}

export function InputPanel({
  input,
  updateInput,
  currency,
  setCurrency,
  loanType,
  setLoanType,
  isCalculated,
  onCalculate,
}: InputPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "tween", duration: 0.5, ease: "easeOut" }}
      className="glass-card rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Loan Details</h2>
        <Select
          value={currency.code}
          onValueChange={(v) => {
            const found = CURRENCIES.find((c) => c.code === v);
            if (found) setCurrency(found);
          }}
        >
          <SelectTrigger className="w-[120px] bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loan Type */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LOAN_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => {
              setLoanType(type);
              const defaults = LOAN_DEFAULTS[type];
              if (defaults) updateInput(defaults);
            }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 ${
              loanType === type
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            {loanIcons[type]}
            <span className="whitespace-nowrap">{type.replace(" Loan", "")}</span>
          </button>
        ))}
      </div>

      {/* Loan Amount */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Loan Amount</Label>
          <EditableValue
            value={input.principal}
            displayValue={`${currency.symbol}${input.principal.toLocaleString("en-IN")}`}
            onCommit={(v) => updateInput({ principal: v })}
            min={100000}
            max={50000000}
            step={100000}
          />
        </div>
        <Slider
          value={[input.principal]}
          onValueChange={([v]) => updateInput({ principal: v })}
          min={100000}
          max={50000000}
          step={100000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currency.symbol}1L</span>
          <span>{currency.symbol}5Cr</span>
        </div>
      </div>

      {/* Interest Rate */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Interest Rate (p.a.)</Label>
          <EditableValue
            value={input.annualRate}
            displayValue={`${input.annualRate.toFixed(1)}%`}
            onCommit={(v) => updateInput({ annualRate: Math.round(v * 10) / 10 })}
            min={1}
            max={30}
            step={0.1}
            parseValue={(raw) => parseFloat(raw)}
          />
        </div>
        <Slider
          value={[input.annualRate]}
          onValueChange={([v]) => updateInput({ annualRate: Math.round(v * 10) / 10 })}
          min={1}
          max={30}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1%</span>
          <span>30%</span>
        </div>
      </div>

      {/* Tenure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Tenure</Label>
          <EditableValue
            value={input.tenureYears}
            displayValue={`${input.tenureYears} years`}
            onCommit={(v) => updateInput({ tenureYears: v })}
            min={1}
            max={30}
            step={1}
          />
        </div>
        <Slider
          value={[input.tenureYears]}
          onValueChange={([v]) => updateInput({ tenureYears: v })}
          min={1}
          max={30}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 yr</span>
          <span>30 yrs</span>
        </div>
      </div>

      {!isCalculated && (
        <Button onClick={onCalculate} className="w-full" size="lg">
          Calculate My EMI
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
