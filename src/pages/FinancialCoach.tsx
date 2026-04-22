import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { PayoffChart } from "@/components/PayoffChart";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import {
  Pencil, ChevronLeft, Sparkles, TrendingUp, Shield, Info,
  AlertTriangle, Home, Wallet, Target, Lightbulb, ArrowRight,
  Plus, Minus, Check, Lock
} from "lucide-react";

/* ─────────── helpers ─────────── */
const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtL = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

function calcEMI(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function simulateLoan(principal: number, annualRate: number, emi: number, extraMonthly: number) {
  const r = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const max = 360;
  const schedule = [];

  while (balance > 0.01 && months < max) {
    const interest = balance * r; // Strict Float precision
    totalInterest += interest;
    
    let payment = emi + extraMonthly;
    if (payment > balance + interest) {
       payment = balance + interest;
    }
    
    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);
    
    schedule.push({ 
       balance: balance, 
       principal: principalPaid 
    });
    months++;
  }
  return { 
    months, 
    tenure: Math.round((months / 12) * 10) / 10, 
    totalInterest: totalInterest,
    schedule 
  };
}

/* animated number */
function useAnimated(target: number, duration = 500) {
  const [val, setVal] = useState(target);
  const raf = useRef(0);
  useEffect(() => {
    const start = val;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + (target - start) * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

function AnimNum({ value }: { value: number }) {
  const v = useAnimated(value);
  return <>{v.toLocaleString("en-IN")}</>;
}

/* ─────────── stepper ─────────── */
interface StepperProps {
  label: string;
  subtitle?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
}
function AllocationStepper({ label, subtitle, value, onChange, min = 0, max = 999999, step = 500, color = "#3B82F6" }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          {subtitle && <span className="text-[10px] text-slate-400 font-medium leading-tight">{subtitle}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <Minus className="w-3 h-3 text-slate-600" />
        </button>
        {editing ? (
          <input
            autoFocus
            className="w-24 h-7 bg-white text-slate-900 text-xs text-center rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
            value={raw}
            onChange={e => setRaw(e.target.value)}
            onBlur={() => {
              const parsed = parseInt(raw.replace(/[^\d]/g, ""), 10);
              if (!isNaN(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
              setEditing(false);
            }}
            onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
        ) : (
          <button
            onClick={() => { setRaw(String(value)); setEditing(true); }}
            className="w-24 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs text-center rounded-lg transition-colors tabular-nums"
          >
            ₹{value.toLocaleString("en-IN")}
          </button>
        )}
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <Plus className="w-3 h-3 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

/* ─────────── chip group ─────────── */
function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${value === o
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ─────────── main page ─────────── */
export default function FinancialCoach() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  // Progress logic
  const [activeStep, setActiveStep] = useState(1);
  const [reportUnlocked, setReportUnlocked] = useState(false);

  // Parse loan data from URL
  const urlPrincipalRaw = sp.get("principal");
  const urlPrincipal = parseInt(urlPrincipalRaw ?? "2500000");
  const urlRate = parseFloat(sp.get("rate") ?? "8.5");
  const urlTenure = parseInt(sp.get("tenure") ?? "20");
  const urlEmi = parseInt(sp.get("emi") ?? "0");

  // Loan details (editable inline - defaults to open if no URL parameters passed)
  const [loanOpen, setLoanOpen] = useState(!urlPrincipalRaw);
  const [principal, setPrincipal] = useState(urlPrincipal);
  const [rate, setRate] = useState(urlRate);
  const [tenure, setTenure] = useState(urlTenure);

  const calcedEmi = useMemo(() => calcEMI(principal, rate, tenure), [principal, rate, tenure]);
  const emi = urlEmi > 0 && !loanOpen ? urlEmi : calcedEmi;

  // Financial inputs
  const [income, setIncome] = useState(80000);
  const [expenses, setExpenses] = useState(32000);
  const [obligations, setObligations] = useState(10000);
  const [emergencyFund, setEmergencyFund] = useState("3-6");
  const [riskAppetite, setRiskAppetite] = useState("Balanced");
  const [salaryGrowth, setSalaryGrowth] = useState("Medium (5-10%)");

  // Big expense
  const [hasBigExpense, setHasBigExpense] = useState(false);
  const [bigAmount, setBigAmount] = useState(500000);
  const [bigMonths, setBigMonths] = useState("12");

  /* ── engine ── */
  const engine = useMemo(() => {
    const totalOut = expenses + obligations + emi;
    const expensePct = Math.round(((expenses + obligations) / income) * 100);
    const freeCash = income - totalOut;
    const isNegative = freeCash <= 0;

    let bigMonthly = 0;
    let bigCapped = false;
    if (hasBigExpense) {
      const raw = Math.round(bigAmount / parseInt(bigMonths));
      const cap = Math.round(freeCash * 0.4);
      if (raw > cap) {
        bigMonthly = cap;
        bigCapped = true;
      } else {
        bigMonthly = raw;
      }
    }
    const remaining = Math.max(0, freeCash - bigMonthly);

    // Allocation base pcts
    let lP = 30, iP = 40, liP = 30;
    if (riskAppetite === "Conservative") { lP = 20; iP = 40; liP = 40; }
    if (riskAppetite === "Aggressive") { lP = 50; iP = 30; liP = 20; }

    // Safety adj
    const safetyLevel =
      emergencyFund === "6+" ? "HIGH" :
        emergencyFund === "3-6" ? "MEDIUM" : "LOW";
    if (safetyLevel === "LOW") lP = Math.max(5, lP - 10);

    const tot = lP + iP + liP;
    const lPn = Math.round(lP / tot * 100);
    const iPn = Math.round(iP / tot * 100);
    const liPn = 100 - lPn - iPn;

    const loanAllocRaw = Math.round(remaining * lPn / 100);
    const investAllocRaw = Math.round(remaining * iPn / 100);
    const lifestyleAllocRaw = remaining - loanAllocRaw - investAllocRaw;

    const financialMode =
      safetyLevel === "HIGH" && expensePct < 50 && (emi / income) < 0.4 ? "Strong" :
        safetyLevel !== "LOW" && expensePct <= 50 ? "Moderate" : "Weak";

    const trustMsg =
      isNegative ? "Your current expenses exceed income. We can't optimize negative cash." :
        expensePct > 50 ? "You're burning over half your income just to exist. Enjoy the lifestyle, but your future self is going to have to work forever." :
        safetyLevel === "LOW" ? "Build an emergency fund before trying to aggressively prepay debt." :
          financialMode === "Strong" ? "Excellent financial position — this plan aggressively maximises your wealth." :
            "Balanced approach — managing loan and lifestyle logically.";

    return {
      freeCash, isNegative, remaining, expensePct, safetyLevel,
      bigMonthly, bigCapped, financialMode,
      allocLoanRaw: loanAllocRaw, allocInvestRaw: investAllocRaw, allocLifestyleRaw: lifestyleAllocRaw,
      totalOutgoing: expenses + investments + emi,
      trustMsg,
      without: simulateLoan(principal, rate, emi, 0)
    };
  }, [principal, rate, tenure, emi, income, expenses, investments, emergencyFund, riskAppetite, hasBigExpense, bigAmount, bigMonths]);

  // Overrideable allocations
  const [overrides, setOverrides] = useState<{ loan: number; invest: number; lifestyle: number } | null>(null);
  useEffect(() => { setOverrides(null); }, [engine.allocLoanRaw, engine.allocInvestRaw]);

  const allocLoan = overrides?.loan ?? engine.allocLoanRaw;
  const allocInvest = overrides?.invest ?? engine.allocInvestRaw;
  const allocLifestyle = overrides?.lifestyle ?? engine.allocLifestyleRaw;

  // React to sliders natively setting strategy
  const activeExtraEmi = Math.round(allocLoan * 0.7);
  const activeLumpSum = allocLoan - activeExtraEmi;
  const activeWithStrat = useMemo(() => simulateLoan(principal, rate, emi, activeExtraEmi), [principal, rate, emi, activeExtraEmi]);
  const interestSaved = engine.without.totalInterest - activeWithStrat.totalInterest;
  const tenureReduced = Math.round((engine.without.tenure - activeWithStrat.tenure) * 10) / 10;

  const setAllocDirect = useCallback((key: "loan" | "invest" | "lifestyle", val: number) => {
    const cur = overrides ?? { loan: engine.allocLoanRaw, invest: engine.allocInvestRaw, lifestyle: engine.allocLifestyleRaw };
    const diff = val - cur[key];
    const otherKey = key === "lifestyle" ? "loan" : "lifestyle";
    setOverrides({ ...cur, [key]: val, [otherKey]: Math.max(0, cur[otherKey] - diff) });
  }, [overrides, engine]);

  const totalAlloc = allocLoan + allocInvest + allocLifestyle + engine.bigMonthly;

  /* pie data */
  const PIE_COLORS = {
    loan: "#22C55E",
    invest: "#3B82F6",
    lifestyle: "#EC4899",
    bigexp: "#F97316",
  };
  const pieData = [
    { name: "Loan Prepayment", value: allocLoan, color: PIE_COLORS.loan },
    { name: "Investments", value: allocInvest, color: PIE_COLORS.invest },
    { name: "Lifestyle", value: allocLifestyle, color: PIE_COLORS.lifestyle },
    ...(engine.bigMonthly > 0 ? [{ name: "Big Expense Fund", value: engine.bigMonthly, color: PIE_COLORS.bigexp }] : []),
  ];

  /* Unlock report */
  const unlockReport = () => {
    setReportUnlocked(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#22C55E', '#FBBF24', '#EC4899']
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors text-sm font-bold mb-2 group"
          >
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Calculator
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Smart Loan & Money Engine</h1>
          <p className="text-sm text-slate-500 mt-0.5">Adjust inputs — see results instantly →</p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* ════════════════ LEFT PANEL ════════════════ */}
          <div className="space-y-4 pb-20 lg:pb-0">

            {/* ── 1. Loan Details card ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Loan Details</p>
                <button
                  onClick={() => setLoanOpen(v => !v)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                >
                  {loanOpen ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!loanOpen ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {[
                      ["Loan Amount", fmt(principal)],
                      ["Interest Rate (p.a.)", `${rate}%`],
                      ["Tenure", `${tenure} years`],
                      ["EMI", fmt(emi)],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">{l}</span>
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{v}</span>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <LabeledSlider label="Loan Amount" display={fmt(principal)} value={principal} onDirectChange={setPrincipal}>
                      <Slider value={[principal]} min={100000} max={20000000} step={50000} onValueChange={([v]) => setPrincipal(v)} />
                    </LabeledSlider>
                    <LabeledSlider label="Interest Rate" display={`${rate}%`} value={rate} onDirectChange={v => setRate(v)}>
                      <Slider value={[rate]} min={6} max={15} step={0.1} onValueChange={([v]) => setRate(Math.round(v * 10) / 10)} />
                    </LabeledSlider>
                    <LabeledSlider label="Tenure (years)" display={`${tenure} yrs`} value={tenure} onDirectChange={setTenure}>
                      <Slider value={[tenure]} min={1} max={30} step={1} onValueChange={([v]) => setTenure(v)} />
                    </LabeledSlider>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-xs text-slate-400">Auto-calculated EMI</span>
                      <span className="text-sm font-bold text-slate-900">{fmt(calcedEmi)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeStep === 1 && (
                <button
                  onClick={() => setActiveStep(2)}
                  className="w-full mt-5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                >
                  Looks good, continue
                </button>
              )}
            </motion.div>

            {/* ── 2. Incoming & Outgoing ── */}
            <AnimatePresence>
              {activeStep >= 2 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Incoming & Outgoing</p>
                  <div className="space-y-5">
                    <LabeledSlider
                      label="Monthly Income"
                      subtitle="Salary, Rental Income, and others"
                      display={fmt(income)}
                      badge={`₹${Math.round(income / 1000)}K`}
                      value={income}
                      onDirectChange={setIncome}
                    >
                      <Slider value={[income]} min={20000} max={500000} step={1000} onValueChange={([v]) => setIncome(v)} />
                    </LabeledSlider>
                    
                    <LabeledSlider
                      label="Monthly Expenses"
                      subtitle="Rent, Groceries, Bills, etc."
                      display={fmt(expenses)}
                      badge={`${Math.round(((expenses + obligations) / income) * 100)}% of income`}
                      value={expenses}
                      onDirectChange={setExpenses}
                    >
                      <Slider value={[expenses]} min={1000} max={300000} step={1000} onValueChange={([v]) => setExpenses(v)} />
                    </LabeledSlider>

                    <LabeledSlider
                      label="Monthly Obligations"
                      subtitle="EMIs, Subscriptions, Insurance, etc."
                      display={fmt(obligations)}
                      badge={`${Math.round((obligations / income) * 100)}% of income`}
                      value={obligations}
                      onDirectChange={setObligations}
                    >
                      <Slider value={[obligations]} min={0} max={100000} step={500} onValueChange={([v]) => setObligations(v)} />
                    </LabeledSlider>
                  </div>

                  {activeStep === 2 && (
                    <button
                      onClick={() => setActiveStep(3)}
                      className="w-full mt-5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      Next: Your Goals & Behavior
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 3. Future & Behavior ── */}
            <AnimatePresence>
              {activeStep >= 3 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Future & Behavior</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800 mb-2">How many months of savings do you have?</p>
                      <Chips options={["0-1", "1-3", "3-6", "6+"]} value={emergencyFund} onChange={setEmergencyFund} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 mb-2">Risk Appetite</p>
                      <Chips options={["Conservative", "Balanced", "Aggressive"]} value={riskAppetite} onChange={setRiskAppetite} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 mb-2">Salary Growth</p>
                      <Chips options={["Low (0-5%)", "Medium (5-10%)", "High (10%+)"]} value={salaryGrowth} onChange={setSalaryGrowth} />
                    </div>
                  </div>

                  {activeStep === 3 && (
                    <button
                      onClick={() => setActiveStep(4)}
                      className="w-full mt-5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      Next: Big Expenses
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 4. Upcoming Big Expense ── */}
            <AnimatePresence>
              {activeStep >= 4 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Upcoming Big Expense</p>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Planning for a major purchase?</h4>
                    </div>
                    <button
                      onClick={() => setHasBigExpense(v => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasBigExpense ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasBigExpense ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {hasBigExpense ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-1">
                          <LabeledSlider label="Amount needed" display={fmt(bigAmount)} value={bigAmount} onDirectChange={setBigAmount}>
                            <Slider value={[bigAmount]} min={50000} max={2000000} step={10000}
                              onValueChange={([v]) => setBigAmount(v)} />
                          </LabeledSlider>
                          <div>
                            <p className="text-xs text-slate-500 mb-2">Timeline</p>
                            <Chips options={["3", "6", "12", "24"]} value={bigMonths} onChange={setBigMonths} />
                            <p className="text-xs text-slate-400 mt-1.5">
                              ≈ {fmt(Math.round(bigAmount / parseInt(bigMonths)))} / month
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="py-2 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                          Toggle to plan for a wedding, car, travel, or any other major life purchase.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ════════════════ RIGHT PANEL — Sticky Lock + White Theme Report ════════════════ */}
          <div className={`relative ${!reportUnlocked ? "sticky top-24 h-[calc(100vh-120px)] overflow-hidden" : ""}`}>
            {/* The blur overlay lock screen */}
            <AnimatePresence>
              {!reportUnlocked && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-20 flex flex-col items-center pt-16 text-center px-6 bg-slate-100/80 backdrop-blur-[16px] border border-slate-200 rounded-3xl overflow-hidden"
                >
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm">
                    <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Build Your Strategy</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      Complete your profile step-by-step on the left to securely calculate and visually unlock your bespoke financial path forward.
                    </p>
                    <button 
                      onClick={activeStep === 4 ? unlockReport : undefined}
                      className={`w-full py-3 px-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeStep === 4 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {activeStep === 4 ? "Unlock My Strategy Now" : "Waiting for inputs..."}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The actual underlying report card */}
            <motion.div 
              initial={false}
              animate={{ opacity: reportUnlocked ? 1 : 0.6 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-200 space-y-6 ${!reportUnlocked ? "pointer-events-none filter blur-[8px]" : ""}`}
            >

              {/* header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-slate-900 font-extrabold text-xl">Your Smart Financial Strategy</h2>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${engine.financialMode === "Strong" ? "bg-green-100 text-green-700" :
                  engine.financialMode === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                  {engine.financialMode} Structure
                </span>
              </div>

              {/* ── ROW 1: Summary stats ── */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={<Home className="w-5 h-5" />}
                  label="Loan Balance"
                  value={fmtL(principal)}
                  sub={`${tenure} Years Left`}
                  color="blue"
                />
                <StatCard
                  icon={<Wallet className="w-5 h-5" />}
                  label="Monthly Income"
                  value={fmtL(income)}
                  sub={`EMI: ${fmtL(emi)}`}
                  color="green"
                />
                <StatCard
                  icon={<Target className="w-5 h-5" />}
                  label="Total Outgoing"
                  value={fmtL(engine.totalOutgoing)}
                  sub={`${Math.round((engine.totalOutgoing / income) * 100)}% of income`}
                  color={engine.totalOutgoing > income * 0.7 ? "orange" : "purple"}
                />
              </div>

              {/* Free cash banner */}
              {engine.isNegative ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-700">{engine.trustMsg}</p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="relative">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">Free Cash Available</p>
                    <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                      ₹<AnimNum value={engine.freeCash} />
                      <span className="text-base font-medium text-slate-400 ml-1.5">/ month</span>
                    </p>
                  </div>
                  <div className="text-right relative">
                    <p className="text-xs font-semibold text-slate-400">Calculated after</p>
                    <p className="text-[11px] font-bold text-slate-600 mt-0.5 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100 inline-block">EMI + Expenses + Invest</p>
                  </div>
                </div>
              )}

              {/* ── ROW 2: Allocation + Pie ── */}
              {!engine.isNegative && (
                <div className="grid md:grid-cols-2 gap-5">
                  {/* allocation steppers */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Allocation</p>
                      {overrides && (
                        <button onClick={() => setOverrides(null)} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-2 py-1 rounded-md transition-colors">
                          Reset Default
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 divide-y divide-slate-100">
                      <AllocationStepper
                        label="Loan Prepayment"
                        value={allocLoan}
                        onChange={v => setAllocDirect("loan", v)}
                        max={engine.remaining}
                        color={PIE_COLORS.loan}
                      />
                      <AllocationStepper
                        label="Investments"
                        value={allocInvest}
                        onChange={v => setAllocDirect("invest", v)}
                        max={engine.remaining}
                        color={PIE_COLORS.invest}
                      />
                      <AllocationStepper
                        label="Lifestyle"
                        value={allocLifestyle}
                        onChange={v => setAllocDirect("lifestyle", v)}
                        max={engine.remaining}
                        color={PIE_COLORS.lifestyle}
                      />
                      {engine.bigMonthly > 0 && (
                        <div className="py-2 pt-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS.bigexp }} />
                              <span className="text-sm font-medium text-slate-700">Big Expense Fund</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-500 tabular-nums bg-slate-50 px-2 py-0.5 rounded shadow-sm border border-slate-100">
                              {fmt(engine.bigMonthly)}
                            </span>
                          </div>
                          {engine.bigCapped && hasBigExpense && (
                            <div className="text-[10px] text-orange-700 font-bold bg-orange-50 p-2.5 rounded-lg border border-orange-100 flex items-start gap-1.5 shadow-sm mt-2">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <p>(Capped at 40% of free cash. You can accumulate {fmt(engine.bigMonthly * parseInt(bigMonths))} in {bigMonths} months — {fmt(bigAmount - (engine.bigMonthly * parseInt(bigMonths)))} short of your {fmt(bigAmount)} target.)</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Total distributed</span>
                      <span className="text-slate-900 font-black tabular-nums">{fmt(totalAlloc)}</span>
                    </div>
                  </div>

                  {/* pie chart */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Allocation Split</p>
                    <div className="h-44 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData.filter(d => d.value > 0)} 
                            cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                            paddingAngle={2} dataKey="value" strokeWidth={0} animationDuration={500}
                          >
                            {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip
                            formatter={(v: number) => fmt(v)}
                            contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center mt-0.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</p>
                          <p className="text-lg font-black text-slate-900 tracking-tight">{fmtL(totalAlloc)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-4 px-2">
                      {pieData.filter(d => d.value > 0).map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-[11px] font-semibold text-slate-600 truncate">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ROW 3: Loan Impact + Strategy ── */}
              {!engine.isNegative && (
                <div className="grid md:grid-cols-2 gap-5 mt-4">
                  {/* Loan Impact - Reusing sophisticated chart */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Loan Impact</p>
                    <div className="flex-1 mt-1">
                       <PayoffChart 
                          original={{
                            ...engine.without,
                            schedule: engine.without.schedule
                          }} 
                          optimized={{
                             ...activeWithStrat,
                             schedule: activeWithStrat.schedule
                          }} 
                          symbol="₹" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-1 pt-4 border-t border-slate-100">
                      <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Years Saved</p>
                        <p className="text-2xl font-black text-green-600 tabular-nums tracking-tight">-{tenureReduced}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Interest Kept</p>
                        <p className="text-2xl font-black text-blue-600 tabular-nums tracking-tight">{fmtL(interestSaved)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Loan Strategy Details</p>
                    <div className="space-y-3.5 flex-1">
                      <StrategyItem
                        step={1}
                        title={`Extra EMI: ${fmt(activeExtraEmi)}/mo`}
                        desc="70% of loan allocation applied monthly as direct principal payment."
                        color="green"
                      />
                      <StrategyItem
                        step={2}
                        title={`Lump Sum Reserve: ${fmt(activeLumpSum)}/mo`}
                        desc="Accumulate remaining 30% for a powerful yearly lump sum prepayment."
                        color="blue"
                      />
                      {hasBigExpense && engine.bigMonthly > 0 && (
                        <StrategyItem
                          step={3}
                          title={`Big Expense Fund: ${fmt(engine.bigMonthly)}/mo`}
                          desc={`Save ₹${(parseInt(bigMonths) * engine.bigMonthly).toLocaleString("en-IN")} completely liquid over exactly ${bigMonths} months.`}
                          color="orange"
                        />
                      )}
                    </div>

                    {/* Trust Msg */}
                    <div className={`mt-5 p-4 rounded-xl border-l-4 ${engine.isNegative || engine.expensePct > 50 
                      ? "border-red-400 bg-red-50"
                      : engine.financialMode === "Strong"
                      ? "border-green-500 bg-green-50"
                      : "border-yellow-400 bg-yellow-50"
                      }`}>
                      <div className="flex gap-3">
                        <Shield className={`w-5 h-5 flex-shrink-0 ${engine.isNegative || engine.expensePct > 50 ? "text-red-500" : engine.financialMode === "Strong" ? "text-green-500" : "text-yellow-500"}`} />
                        <p className={`text-sm font-medium leading-relaxed ${engine.isNegative || engine.expensePct > 50 ? "text-red-700" : "text-slate-700"}`}>{engine.trustMsg}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Insights & Tips ── */}
              {!engine.isNegative && (
                <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Coach Insights & Tips</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <InsightCard
                      title="Expense Ratio"
                      value={`${engine.expensePct}% consumed`}
                      tip={engine.expensePct > 50 ? "Consider cutting costs immediately. This burn rate is severely slowing wealth generation." : "Healthy control on expenses. Keep the burn rate stable."}
                      type={engine.expensePct > 50 ? "warn" : "ok"}
                    />
                    <InsightCard
                      title="EMI Burden"
                      value={`${Math.round((emi / income) * 100)}% of income`}
                      tip={emi / income > 0.4 ? "EMI exceeds 40% of income. Caution with new debt." : "EMI proportion is mathematically manageable."}
                      type={emi / income > 0.4 ? "warn" : "ok"}
                    />
                    <InsightCard
                      title="Emergency Depth"
                      value={emergencyFund + " months"}
                      tip={emergencyFund === "0-1" ? "Pause aggressiveness. Build a 3-month strictly liquid emergency runway first." : "Good safety cushion in place to absorb shocks."}
                      type={emergencyFund === "0-1" ? "warn" : "ok"}
                    />
                    <InsightCard
                      title="Net Forward Velocity"
                      value={`Pacing +${fmt(engine.remaining)}/mo`}
                      tip={`You're successfully driving capital into wealth-generation. Strategy aligns with metrics.`}
                      type="ok"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PIE_COLORS = {
  loan: "#22C55E",
  invest: "#3B82F6",
  lifestyle: "#EC4899",
  bigexp: "#F97316",
};

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{label}</p>
      <p className="text-lg font-black text-slate-900 tabular-nums tracking-tight leading-tight">{value}</p>
      <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{sub}</p>
    </div>
  );
}

function LabeledSlider({ label, subtitle, display, badge, value, onDirectChange, children }: { label: string; subtitle?: string; display: string; badge?: string; value?: number; onDirectChange?: (v: number) => void; children: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  
  return (
      <div className="flex justify-between items-baseline">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-800">{label}</label>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">{badge}</span>}
          {editing && onDirectChange ? (
              <input
                autoFocus
                className="w-24 h-7 text-sm font-black text-blue-600 bg-white border border-blue-300 px-2 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={raw}
                onChange={e => setRaw(e.target.value)}
                onBlur={() => {
                    const parsed = parseInt(raw.replace(/[^\d]/g, ""), 10);
                    if (!isNaN(parsed)) onDirectChange(parsed);
                    setEditing(false);
                }}
                onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              />
          ) : (
              <button 
                onClick={() => { 
                  if (onDirectChange && value !== undefined) { 
                    setRaw(String(value)); 
                    setEditing(true); 
                  } 
                }} 
                className={`text-sm font-black text-blue-600 border border-blue-100 bg-blue-50 px-2.5 py-0.5 rounded-lg tabular-nums tracking-tight ${onDirectChange ? 'cursor-text hover:bg-blue-100' : 'cursor-default'}`}
              >
                  {display}
              </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function StrategyItem({ step, title, desc, color }: { step: number; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const badgeColors: Record<string, string> = {
    green: "bg-green-200 text-green-800",
    blue: "bg-blue-200 text-blue-800",
    orange: "bg-orange-200 text-orange-800",
  };
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${colors[color]} shadow-sm`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5 ${badgeColors[color]}`}>{step}</span>
      <div>
        <p className="text-sm font-black text-slate-900 tracking-tight">{title}</p>
        <p className="text-[11px] font-medium text-slate-600 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function InsightCard({ title, value, tip, type }: { title: string; value: string; tip: string; type: "ok" | "warn" }) {
  return (
    <div className={`p-4 rounded-xl border ${type === "warn" ? "border-orange-200 bg-orange-50 shadow-sm" : "border-slate-200 bg-white shadow-sm"}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{title}</p>
        {type === "warn"
          ? <AlertTriangle className="w-4 h-4 text-orange-500" />
          : <Check className="w-4 h-4 text-green-500" />
        }
      </div>
      <p className="text-base font-black text-slate-900 mb-1.5 tabular-nums tracking-tight">{value}</p>
      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{tip}</p>
    </div>
  );
}
