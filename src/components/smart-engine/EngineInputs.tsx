import { FinancialInputs } from "@/hooks/useAllocationEngine";
import { STEPS, useProgressiveSteps } from "@/hooks/useProgressiveSteps";
import { Slider } from "@/components/ui/slider";
import { Check, Lock, ChevronDown, RotateCcw, ArrowRight, Pencil } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

interface Props {
  inputs: FinancialInputs;
  onChange: (updates: Partial<FinancialInputs>) => void;
  steps: ReturnType<typeof useProgressiveSteps>;
}

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function calcEMI(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === opt
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

interface StepProps {
  id: string;
  index: number;
  state: "locked" | "active" | "done";
  onActivate: () => void;
  onContinue: () => void;
  summary: string;
  children: ReactNode;
}

function StepCard({ id, index, state, onActivate, onContinue, summary, children }: StepProps) {
  const step = STEPS.find((s) => s.id === id)!;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === "active" && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state]);

  if (state === "locked") {
    return (
      <div className="step-card step-card-locked p-4 animate-step-rise">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{step.title}</p>
            <p className="text-[11px] text-muted-foreground/70 truncate">Coming up next</p>
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div
        ref={ref}
        onClick={onActivate}
        className="step-card step-card-done p-3.5 animate-step-rise group"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-success" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{step.title}</p>
            <p className="text-sm font-semibold text-foreground truncate">{summary}</p>
          </div>
          <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="step-card step-card-active p-5 animate-step-rise">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold tabular-nums">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground leading-tight">{step.title}</h3>
          <p className="text-xs text-muted-foreground">{step.hint}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      <button
        onClick={onContinue}
        className="mt-5 w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        Continue
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  display,
}: {
  label: string;
  value: ReactNode;
  display: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-base font-bold text-foreground tabular-nums">{display}</span>
      </div>
      {value}
    </div>
  );
}

export default function InputPanel({ inputs, onChange, steps }: Props) {
  const calculatedEmi = calcEMI(inputs.loanAmount, inputs.interestRate, inputs.remainingTenure);

  const summaries: Record<string, string> = {
    loanAmount: fmt(inputs.loanAmount),
    interestRate: `${inputs.interestRate}%`,
    tenure: `${inputs.remainingTenure} years`,
    emi: fmt(inputs.emiOverride ?? calculatedEmi),
    income: `${fmt(inputs.income)} / month`,
    expenses: `${inputs.expensePercent}% (${fmt(Math.round(inputs.income * inputs.expensePercent / 100))})`,
    investments: `${fmt(inputs.currentInvestments)} / month`,
    emergency: `${inputs.emergencyFund} months`,
    bigExpense: inputs.hasBigExpense
      ? `${fmt(inputs.bigExpenseAmount)} in ${inputs.bigExpenseTimeline}mo`
      : "None planned",
    risk: inputs.riskAppetite,
    growth: inputs.salaryGrowth,
    priority: inputs.lifePriority < 40 ? "Loan focused" : inputs.lifePriority > 60 ? "Lifestyle focused" : "Balanced",
  };

  const stateOf = (id: string): "locked" | "active" | "done" => {
    if (steps.activeStep === id) return "active";
    if (steps.completed.has(id)) return "done";
    if (steps.isUnlocked(id)) return "active";
    return "locked";
  };

  const renderStep = (id: string, content: ReactNode) => {
    const idx = STEPS.findIndex((s) => s.id === id);
    return (
      <StepCard
        key={id}
        id={id}
        index={idx}
        state={stateOf(id)}
        onActivate={() => steps.setActiveStep(id)}
        onContinue={() => steps.completeStep(id)}
        summary={summaries[id]}
      >
        {content}
      </StepCard>
    );
  };

  return (
    <div className="h-[600px] overflow-y-auto bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-lg font-bold text-foreground">Your Money Plan</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {steps.completed.size}/{STEPS.length}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary progress-bar-fill rounded-full"
            style={{ width: `${steps.progress}%` }}
          />
        </div>
        {steps.allDone && (
          <button
            onClick={steps.reset}
            className="mt-3 text-xs text-primary flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" /> Start over
          </button>
        )}
      </div>

      <div className="p-6 space-y-3 pb-24">
        {/* Step 1: Loan Amount */}
        {renderStep(
          "loanAmount",
          <SliderRow
            label="Outstanding balance"
            display={fmt(inputs.loanAmount)}
            value={
              <Slider
                value={[inputs.loanAmount]}
                min={100000}
                max={20000000}
                step={50000}
                onValueChange={([v]) => onChange({ loanAmount: v })}
              />
            }
          />
        )}

        {/* Step 2: Interest Rate */}
        {renderStep(
          "interestRate",
          <SliderRow
            label="Annual rate"
            display={`${inputs.interestRate}%`}
            value={
              <Slider
                value={[inputs.interestRate]}
                min={6}
                max={15}
                step={0.1}
                onValueChange={([v]) => onChange({ interestRate: Math.round(v * 10) / 10 })}
              />
            }
          />
        )}

        {/* Step 3: Tenure */}
        {renderStep(
          "tenure",
          <SliderRow
            label="Years left"
            display={`${inputs.remainingTenure} yrs`}
            value={
              <Slider
                value={[inputs.remainingTenure]}
                min={1}
                max={30}
                step={1}
                onValueChange={([v]) => onChange({ remainingTenure: v })}
              />
            }
          />
        )}

        {/* Step 4: EMI */}
        {renderStep(
          "emi",
          <div className="space-y-3">
            <SliderRow
              label="Monthly EMI"
              display={fmt(inputs.emiOverride ?? calculatedEmi)}
              value={
                <Slider
                  value={[inputs.emiOverride ?? calculatedEmi]}
                  min={Math.max(1000, Math.round(calculatedEmi * 0.5))}
                  max={Math.round(calculatedEmi * 1.5)}
                  step={500}
                  onValueChange={([v]) =>
                    onChange({ emiOverride: v === calculatedEmi ? null : v })
                  }
                />
              }
            />
            {inputs.emiOverride !== null ? (
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => onChange({ emiOverride: null })}
              >
                Reset to auto ({fmt(calculatedEmi)})
              </button>
            ) : (
              <p className="text-[11px] text-muted-foreground">Auto-calculated from loan details</p>
            )}
          </div>
        )}

        {/* Step 5: Income */}
        {renderStep(
          "income",
          <SliderRow
            label="Take-home"
            display={fmt(inputs.income)}
            value={
              <Slider
                value={[inputs.income]}
                min={20000}
                max={300000}
                step={1000}
                onValueChange={([v]) => onChange({ income: v })}
              />
            }
          />
        )}

        {/* Step 6: Expenses */}
        {renderStep(
          "expenses",
          <SliderRow
            label={`${inputs.expensePercent}% of income`}
            display={fmt(Math.round(inputs.income * inputs.expensePercent / 100))}
            value={
              <Slider
                value={[inputs.expensePercent]}
                min={10}
                max={80}
                step={1}
                onValueChange={([v]) => onChange({ expensePercent: v })}
              />
            }
          />
        )}

        {/* Step 7: Investments */}
        {renderStep(
          "investments",
          <SliderRow
            label="SIPs / mutual funds"
            display={fmt(inputs.currentInvestments)}
            value={
              <Slider
                value={[inputs.currentInvestments]}
                min={0}
                max={100000}
                step={500}
                onValueChange={([v]) => onChange({ currentInvestments: v })}
              />
            }
          />
        )}

        {/* Step 8: Emergency */}
        {renderStep(
          "emergency",
          <ChipGroup
            options={["0-1", "1-3", "3-6", "6+"]}
            value={inputs.emergencyFund}
            onChange={(v) => onChange({ emergencyFund: v })}
          />
        )}

        {/* Step 9: Big Expense */}
        {renderStep(
          "bigExpense",
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Yes, I have one planned</span>
              <button
                onClick={() => onChange({ hasBigExpense: !inputs.hasBigExpense })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  inputs.hasBigExpense ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 shadow-sm ${
                    inputs.hasBigExpense ? "translate-x-5 bg-primary-foreground" : "bg-card"
                  }`}
                />
              </button>
            </div>
            {inputs.hasBigExpense && (
              <div className="space-y-4 pl-3 border-l-2 border-primary/20 animate-step-rise">
                <SliderRow
                  label="Amount needed"
                  display={fmt(inputs.bigExpenseAmount)}
                  value={
                    <Slider
                      value={[inputs.bigExpenseAmount]}
                      min={50000}
                      max={2000000}
                      step={10000}
                      onValueChange={([v]) => onChange({ bigExpenseAmount: v })}
                    />
                  }
                />
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Timeline (months)</label>
                  <ChipGroup
                    options={["3", "6", "12", "24"]}
                    value={String(inputs.bigExpenseTimeline)}
                    onChange={(v) => onChange({ bigExpenseTimeline: Number(v) })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 10: Risk */}
        {renderStep(
          "risk",
          <ChipGroup
            options={["Conservative", "Balanced", "Aggressive"]}
            value={inputs.riskAppetite}
            onChange={(v) => onChange({ riskAppetite: v })}
          />
        )}

        {/* Step 11: Growth */}
        {renderStep(
          "growth",
          <ChipGroup
            options={["Low (0-5%)", "Medium (5-10%)", "High (10%+)"]}
            value={inputs.salaryGrowth}
            onChange={(v) => onChange({ salaryGrowth: v })}
          />
        )}

        {/* Step 12: Priority */}
        {renderStep(
          "priority",
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {inputs.lifePriority < 40
                  ? "🏦 Loan focused"
                  : inputs.lifePriority > 60
                  ? "🎉 Lifestyle focused"
                  : "⚖️ Balanced"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">🏦 Loan</span>
              <Slider
                value={[inputs.lifePriority]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => onChange({ lifePriority: v })}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">🎉 Life</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
