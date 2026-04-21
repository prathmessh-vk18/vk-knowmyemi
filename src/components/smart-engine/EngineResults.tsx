import { AllocationResult } from "@/hooks/useAllocationEngine";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from "recharts";
import {
  TrendingUp, Shield, AlertTriangle, Zap, Target, Wallet, PartyPopper,
  Plus, Minus, ArrowRight, Info
} from "lucide-react";
import { useState, useEffect } from "react";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function AnimatedAmount({ value }: { value: number }) {
  const animated = useAnimatedNumber(value);
  return <>₹{animated.toLocaleString("en-IN")}</>;
}

const COLORS = {
  loan: "hsl(217, 91%, 60%)",
  invest: "hsl(152, 69%, 40%)",
  bigexp: "hsl(38, 92%, 50%)",
  lifestyle: "hsl(262, 83%, 58%)",
};

const ICONS = {
  loan: Wallet,
  invest: TrendingUp,
  bigexp: Target,
  lifestyle: PartyPopper,
};

export default function ResultPanel({ result, completed }: { result: AllocationResult; completed: Set<string> }) {
  // Interactive allocation overrides
  const [overrides, setOverrides] = useState<{ loan: number; investment: number; lifestyle: number } | null>(null);

  // Reset overrides when engine result changes significantly
  useEffect(() => {
    setOverrides(null);
  }, [result.remainingCash, result.allocPercents.loan, result.allocPercents.investment]);

  const alloc = overrides
    ? { ...result.allocations, ...overrides }
    : result.allocations;

  const adjustAllocation = (key: "loan" | "investment" | "lifestyle", delta: number) => {
    const current = overrides ?? {
      loan: result.allocations.loan,
      investment: result.allocations.investment,
      lifestyle: result.allocations.lifestyle,
    };
    const newVal = Math.max(0, current[key] + delta);
    const diff = newVal - current[key];
    // Take from/give to lifestyle if adjusting loan/invest, or from loan if adjusting lifestyle
    const adjustKey = key === "lifestyle" ? "loan" : "lifestyle";
    const adjustVal = Math.max(0, current[adjustKey] - diff);
    setOverrides({ ...current, [key]: newVal, [adjustKey]: adjustVal });
  };

  if (result.isNegative) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Unsustainable Structure</h3>
          <p className="text-muted-foreground text-sm">{result.trustMessage}</p>
          <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
            <p className="text-sm text-muted-foreground">Free cash after EMI</p>
            <p className="text-2xl font-bold text-destructive">{fmt(result.freeCash)}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-secondary">
              <p className="text-[10px] text-muted-foreground">Your EMI</p>
              <p className="text-sm font-bold">{fmt(result.emi)}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary">
              <p className="text-[10px] text-muted-foreground">EMI-to-Income</p>
              <p className="text-sm font-bold">{result.emiToIncomeRatio}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const loanAlloc = overrides?.loan ?? result.allocations.loan;
  const investAlloc = overrides?.investment ?? result.allocations.investment;
  const lifestyleAlloc = overrides?.lifestyle ?? result.allocations.lifestyle;

  const pieData = [
    { name: "Loan", value: loanAlloc, color: COLORS.loan },
    { name: "Invest", value: investAlloc, color: COLORS.invest },
    ...(result.allocations.bigExpense > 0
      ? [{ name: "Big Expense", value: result.allocations.bigExpense, color: COLORS.bigexp }]
      : []),
    { name: "Lifestyle", value: lifestyleAlloc, color: COLORS.lifestyle },
  ];

  const comparisonData = [
    {
      name: "Tenure (yrs)",
      Without: result.simulation.withoutStrategy.tenure,
      With: result.simulation.withStrategy.tenure,
    },
    {
      name: "Interest (₹L)",
      Without: Math.round(result.simulation.withoutStrategy.totalInterest / 100000),
      With: Math.round(result.simulation.withStrategy.totalInterest / 100000),
    },
  ];

  const allocationItems = [
    { key: "loan" as const, label: "Loan Optimization", amount: loanAlloc },
    { key: "invest" as const, label: "Investments", amount: investAlloc },
    ...(result.allocations.bigExpense > 0
      ? [{ key: "bigexp" as const, label: "Big Expense Fund", amount: result.allocations.bigExpense }]
      : []),
    { key: "lifestyle" as const, label: "Lifestyle", amount: lifestyleAlloc },
  ];

  const totalAlloc = allocationItems.reduce((s, i) => s + i.amount, 0);

  const extraEmi = Math.round(loanAlloc * 0.7);
  const lumpSum = loanAlloc - extraEmi;

  // Progressive reveal gates
  const hasLoan = completed.has("emi"); // loan analysis ready after EMI confirmed
  const hasFreeCash = completed.has("investments"); // free cash needs income/expenses/investments
  const hasBigExp = completed.has("bigExpense");
  const hasAllocation = completed.has("risk");
  const hasStrategy = completed.has("priority");

  // Empty state — nothing answered yet
  if (completed.size === 0) {
    return (
      <div className="h-full overflow-y-auto p-6 flex items-center justify-center">
        <div className="max-w-md text-center animate-step-rise">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-9 h-9 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your financial report card</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Answer the questions on the left and we'll build your personalized money plan
            section by section — like a story unfolding.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Wallet, label: "Loan analysis" },
              { icon: TrendingUp, label: "Free cash" },
              { icon: Target, label: "Allocation plan" },
              { icon: Zap, label: "Strategy & impact" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 opacity-60">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto space-y-5">
      {/* Loan Analysis Header */}
      {hasLoan && (
      <div className="glass-card p-5 bg-gradient-to-br from-card to-secondary/30 animate-report-pop">

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">EMI</p>
            <p className="text-lg font-bold text-foreground"><AnimatedAmount value={result.emi} /></p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Interest</p>
            <p className="text-lg font-bold text-destructive"><AnimatedAmount value={result.totalInterest} /></p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">EMI/Income</p>
            <p className={`text-lg font-bold ${result.emiToIncomeRatio > 50 ? "text-destructive" : result.emiToIncomeRatio > 35 ? "text-warning" : "text-success"}`}>
              {result.emiToIncomeRatio}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mode</p>
            <p className={`text-lg font-bold ${
              result.financialMode === "Strong" ? "text-success" : result.financialMode === "Moderate" ? "text-warning" : "text-destructive"
            }`}>{result.financialMode}</p>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">
            💡 You're paying <span className="font-semibold text-foreground">{fmt(result.totalInterest)}</span> in interest on a <span className="font-semibold text-foreground">{fmt(result.emi * result.emiToIncomeRatio)}</span> loan
          </p>
        </div>
      </div>
      )}

      {/* Free Cash */}
      {hasFreeCash && (
      <div className="glass-card p-5 glow-primary animate-report-pop">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">💰 Available After EMI & Expenses</p>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              <AnimatedAmount value={result.freeCash} />
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <StatusBadge
              label={`Safety: ${result.safetyLevel}`}
              level={result.safetyLevel === "HIGH" ? "good" : result.safetyLevel === "MEDIUM" ? "mid" : "low"}
            />
            <StatusBadge
              label={`Cash Flow: ${result.cashFlowLevel}`}
              level={result.cashFlowLevel === "STRONG" ? "good" : result.cashFlowLevel === "MODERATE" ? "mid" : "low"}
            />
          </div>
        </div>
      </div>
      )}

      {/* Big Expense Insight */}
      {hasBigExp && result.bigExpenseCapped && (
        <div className="glass-card p-4 border-l-4 border-l-warning bg-warning/5 animate-report-pop">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-warning mb-1">Big Expense Capped</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{result.bigExpenseCapMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {hasAllocation && (
      <div className="grid grid-cols-2 gap-5 animate-report-pop">
        {/* Donut */}
        <div className="glass-card p-5">

          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Allocation Split</h3>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                  paddingAngle={3} dataKey="value" strokeWidth={0} animationDuration={600}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => fmt(value)}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220, 13%, 91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "13px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{fmt(totalAlloc)}</p>
                <p className="text-[9px] text-muted-foreground">distributed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Before vs After Comparison */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Loan: Before vs After</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220, 13%, 91%)", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Without" fill="hsl(220, 13%, 80%)" radius={[6, 6, 0, 0]} animationDuration={600} />
                <Bar dataKey="With" fill="hsl(152, 69%, 40%)" radius={[6, 6, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      {/* Interactive Allocation Cards */}
      {hasAllocation && (
      <div className="animate-report-pop">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Action Plan</h3>
          {overrides && (
            <button onClick={() => setOverrides(null)} className="text-xs text-primary hover:underline">
              Reset to suggested
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {allocationItems.map((item) => {
            const Icon = ICONS[item.key];
            const color = COLORS[item.key];
            const canAdjust = item.key !== "bigexp";
            const pct = totalAlloc > 0 ? Math.round((item.amount / totalAlloc) * 100) : 0;
            return (
              <div key={item.key} className="glass-card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
                    <p className="text-sm font-bold text-foreground"><AnimatedAmount value={item.amount} /></p>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full allocation-bar" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                {canAdjust && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => adjustAllocation(item.key === "invest" ? "investment" : item.key as any, -500)}
                      className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <span className="text-[10px] text-muted-foreground">₹500</span>
                    <button
                      onClick={() => adjustAllocation(item.key === "invest" ? "investment" : item.key as any, 500)}
                      className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Trade-off Insight */}
      {hasAllocation && result.tradeOffMessage && (
        <div className="glass-card p-3 bg-secondary/30 text-center animate-report-pop">
          <p className="text-xs text-muted-foreground">⚖️ {result.tradeOffMessage}</p>
        </div>
      )}

      {/* Strategy + Impact Row */}
      {hasStrategy && (
      <div className="grid grid-cols-5 gap-5 animate-report-pop">

        <div className="col-span-3 glass-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Loan Strategy</h3>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/5">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div>
                <p className="text-sm font-medium text-foreground">Extra EMI: {fmt(extraEmi)}/mo</p>
                <p className="text-[10px] text-muted-foreground">70% of loan allocation → monthly prepayment</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-success/5">
              <span className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div>
                <p className="text-sm font-medium text-foreground">Lump Sum Reserve: {fmt(lumpSum)}/mo</p>
                <p className="text-[10px] text-muted-foreground">30% saved → yearly lump sum payment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-3">
          <div className="stat-card glow-primary">
            <TrendingUp className="w-5 h-5 text-primary mb-1" />
            <p className="text-xl font-extrabold text-foreground"><AnimatedAmount value={result.simulation.interestSaved} /></p>
            <p className="text-[10px] text-muted-foreground mt-1">Interest Saved</p>
          </div>
          <div className="stat-card glow-success">
            <Shield className="w-5 h-5 text-success mb-1" />
            <p className="text-xl font-extrabold text-foreground">
              {result.simulation.tenureReduced}<span className="text-xs font-normal text-muted-foreground"> yrs</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Tenure Reduced</p>
          </div>
        </div>
      </div>
      )}

      {/* Before vs After Table */}
      {hasStrategy && (
      <div className="glass-card p-5 animate-report-pop">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Loan Structure Comparison</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div />
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">Without Strategy</div>
          <div className="text-[10px] font-semibold text-primary uppercase">With Your Plan</div>

          <div className="text-xs text-muted-foreground text-left">Tenure</div>
          <div className="text-sm font-semibold">{result.simulation.withoutStrategy.tenure} yrs</div>
          <div className="text-sm font-bold text-success">{result.simulation.withStrategy.tenure} yrs</div>

          <div className="text-xs text-muted-foreground text-left">Total Interest</div>
          <div className="text-sm font-semibold">{fmt(result.simulation.withoutStrategy.totalInterest)}</div>
          <div className="text-sm font-bold text-success">{fmt(result.simulation.withStrategy.totalInterest)}</div>

          <div className="text-xs text-muted-foreground text-left">Total Payable</div>
          <div className="text-sm font-semibold">{fmt(result.simulation.withoutStrategy.totalPayable)}</div>
          <div className="text-sm font-bold text-success">{fmt(result.simulation.withStrategy.totalPayable)}</div>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2">
          <ArrowRight className="w-4 h-4 text-success" />
          <p className="text-xs font-medium text-success">
            You save {fmt(result.simulation.interestSaved)} and finish {result.simulation.tenureReduced} years earlier
          </p>
        </div>
      </div>
      )}

      {/* Trust + Explanation */}
      {hasStrategy && (
      <div className="grid grid-cols-2 gap-5 animate-report-pop">

        <div className={`glass-card p-5 border-l-4 ${
          result.trustLevel === "safe" ? "border-l-success" :
          result.trustLevel === "warning" ? "border-l-warning" : "border-l-destructive"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${
              result.trustLevel === "safe" ? "text-success" : "text-warning"
            }`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Assessment</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{result.trustMessage}</p>
        </div>
        <div className="glass-card p-5 bg-gradient-to-br from-card to-secondary/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">💡 Insight</p>
          <p className="text-sm text-muted-foreground leading-relaxed italic">"{result.explanation}"</p>
        </div>
      </div>
      )}
    </div>
  );
}

function StatusBadge({ label, level }: { label: string; level: "good" | "mid" | "low" }) {
  const styles = {
    good: "bg-success/10 text-success",
    mid: "bg-warning/10 text-warning",
    low: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles[level]}`}>
      {label}
    </span>
  );
}
