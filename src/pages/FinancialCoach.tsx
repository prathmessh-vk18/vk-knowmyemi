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
  // Strict NaN/Infinity check
  if (isNaN(principal) || isNaN(annualRate) || isNaN(emi) || isNaN(extraMonthly) || emi <= 0) {
    return { months: 0, tenure: 0, totalInterest: 0, schedule: [] };
  }
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
function AllocationStepper({ label, value, onChange, min = 0, max = 999999, step = 500, color = "#3B82F6" }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5">
        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm group"
        >
          <Minus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        </button>
        {editing ? (
          <input
            autoFocus
            className="w-24 h-8 bg-white text-slate-900 text-sm font-bold text-center rounded-lg border-none focus:ring-0 focus:outline-none"
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
            className="w-24 h-8 text-slate-900 font-bold text-sm text-center tabular-nums"
          >
            ₹{value.toLocaleString("en-IN")}
          </button>
        )}
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm group"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">{subtext}</p>
    </div>
  );
}

function CoachInsightCard({ insight }: { insight: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
      <div className="flex gap-4 items-start relative z-10">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
             COACH INSIGHT
          </p>
          <p className="text-sm font-bold text-blue-900 leading-relaxed max-w-2xl">
            {insight}
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
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
  const [principal, setPrincipal] = useState(urlPrincipal);
  const [rate, setRate] = useState(urlRate);
  const [tenure, setTenure] = useState(urlTenure);
  const [yearsPassed, setYearsPassed] = useState(0);

  const [loanOpen, setLoanOpen] = useState(false); // Default to collapsed if data is fetched

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
  const [bigLabel, setBigLabel] = useState("");

  /* ── engine ── */
  /* ── engine ── */
  const engine = useMemo(() => {
    try {
      const totalOut = (Number(expenses) || 0) + (Number(obligations) || 0) + (Number(emi) || 0);
      const expensePct = Math.round(((Number(expenses) + Number(obligations)) / (Number(income) || 1)) * 100);
      const freeCash = (Number(income) || 0) - totalOut;
      const isNegative = freeCash <= 0;

      // New: Dynamic Lifestyle Floor (5-15% based on surplus)
      const lifestylePct = freeCash < 20000 ? 0.05 : freeCash < 50000 ? 0.10 : 0.15;
      const lifestyleFloor = Math.round(freeCash * lifestylePct);
      const surplusForAlloc = Math.max(0, freeCash - lifestyleFloor);

      const remainingTenure = Math.max(0, tenure - yearsPassed);
      const isLateStage = remainingTenure <= 3;
      const safetyLevel =
        emergencyFund === "6+" ? "HIGH" :
          emergencyFund === "3-6" ? "MEDIUM" : "LOW";
      
      const progressPct = (yearsPassed / (tenure || 1)) * 100;

      let bigMonthly = 0;
      let bigCapped = false;
      let isSafetyBridge = false;

      if (hasBigExpense) {
        const amount = Number(bigAmount) || 0;
        const months = Math.max(1, parseInt(bigMonths) || 1);
        const raw = Math.round(amount / months);
        const cap = Math.round(freeCash * 0.6); 

        if (safetyLevel === "LOW") {
          isSafetyBridge = true;
        }

        if (raw > cap) {
          bigMonthly = cap;
          bigCapped = true;
        } else {
          bigMonthly = raw;
        }
      }
      const remaining = Math.max(0, surplusForAlloc - (bigMonthly || 0));

      const financialMode =
        safetyLevel === "HIGH" && expensePct < 50 && (emi / income) < 0.4 ? "Strong" :
          safetyLevel !== "LOW" && expensePct <= 50 ? "Moderate" : "Weak";

      // DECISION LOGIC: 4-Quarter Matrix
      let emergencyP = 0, lP = 0, iP = 0;
      let stageName = "";

      if (safetyLevel === "LOW") {
        stageName = "Safety First";
        emergencyP = 80;
        lP = 10;
        iP = 10;
      } else {
        if (progressPct <= 25) {
          stageName = "Q1: Interest Defense";
          lP = riskAppetite === "Aggressive" ? 60 : 75;
          iP = 100 - lP;
          emergencyP = 0;
        } else if (progressPct <= 50) {
          stageName = "Q2: Balanced Growth";
          lP = riskAppetite === "Aggressive" ? 40 : 50;
          iP = 100 - lP;
          emergencyP = 0;
        } else if (progressPct <= 75) {
          stageName = "Q3: Growth Pivot";
          lP = riskAppetite === "Aggressive" ? 15 : 25;
          iP = 100 - lP;
          emergencyP = 0;
        } else {
          stageName = "Q4: Wealth Harvest";
          lP = 0;
          iP = 100;
          emergencyP = 0;
        }
      }

      // Apply MEDIUM safety adjustment (divert some to emergency)
      if (safetyLevel === "MEDIUM" && progressPct <= 75) {
         const diversion = 20;
         emergencyP = diversion;
         lP = Math.max(0, lP - (diversion / 2));
         iP = Math.max(0, iP - (diversion / 2));
      }

      let emergencyAllocRaw = Math.round(remaining * (emergencyP / 100)) || 0;
      let loanAllocRaw = Math.round(remaining * (lP / 100)) || 0;
      let investAllocRaw = Math.round(remaining * (iP / 100)) || 0;

      let bigMonthlyFinal = bigMonthly || 0;

      if (isSafetyBridge) {
        const diversion = Math.round(bigMonthlyFinal * 0.5);
        bigMonthlyFinal = bigMonthlyFinal - diversion;
        emergencyAllocRaw += diversion;
      }

      const lifestyleAllocRaw = Math.max(lifestyleFloor, freeCash - emergencyAllocRaw - loanAllocRaw - investAllocRaw - bigMonthlyFinal);

      const trustMsg =
        isNegative ? "Your current expenses exceed income. We can't optimize negative cash." :
          isSafetyBridge ? `⚠️ Risk Warning: You are racing toward a ${fmt(Number(bigAmount) || 0)} goal without a safety net. We've triggered the 'Safety Bridge' strategy to protect you.` :
          expensePct > 50 ? "You're burning over half your income just to exist. Enjoy the lifestyle, but we need to find more breathing room for your future." :
          safetyLevel === "LOW" ? "Let’s get you protected. Before we worry about the loan, we’re building the cash buffer that lets you sleep well at night." :
          progressPct > 75 ? "The finish line is in sight! Interest is negligible now, so we're pouring every extra rupee into building your wealth." :
          progressPct > 50 ? "The pivot point: Your interest costs are now minor. We're shifting focus heavily toward growth to maximize your future." :
          financialMode === "Strong" ? "You're crushing it. We're destroying that interest early and setting you up for a massive wealth harvest down the road." :
          "You've got a great rhythm. You're handling your debt responsibly while still making your money work for you.";

      return {
        freeCash, isNegative, remaining, expensePct, safetyLevel,
        bigMonthly: bigMonthlyFinal, bigCapped, isSafetyBridge, financialMode,
        remainingTenure, isLateStage, progressPct, stageName,
        allocEmergencyRaw: emergencyAllocRaw,
        allocLoanRaw: loanAllocRaw, 
        allocInvestRaw: investAllocRaw, 
        allocLifestyleRaw: lifestyleAllocRaw,
        totalOutgoing: (Number(expenses) || 0) + (Number(obligations) || 0) + (Number(emi) || 0),
        trustMsg,
        without: simulateLoan(principal, rate, emi, 0)
      };
    } catch (e) {
      console.error("Engine failure:", e);
      return {
        freeCash: 0, isNegative: false, remaining: 0, expensePct: 0, safetyLevel: "MEDIUM",
        bigMonthly: 0, bigCapped: false, isSafetyBridge: false, financialMode: "Moderate",
        remainingTenure: 0, isLateStage: false, progressPct: 0, stageName: "Safe Mode",
        allocEmergencyRaw: 0, allocLoanRaw: 0, allocInvestRaw: 0, allocLifestyleRaw: 0,
        totalOutgoing: 0, trustMsg: "Calculating...",
        without: { months: 0, tenure: 0, totalInterest: 0, schedule: [] }
      };
    }
  }, [principal, rate, tenure, yearsPassed, emi, income, expenses, obligations, emergencyFund, riskAppetite, hasBigExpense, bigAmount, bigMonths]);


  // Overrideable allocations
  const [overrides, setOverrides] = useState<{ loan: number; invest: number; emergency: number } | null>(null);
  useEffect(() => { setOverrides(null); }, [engine.allocLoanRaw, engine.allocInvestRaw, engine.allocEmergencyRaw]);

  const allocLoan = Number(overrides?.loan ?? engine.allocLoanRaw) || 0;
  const allocInvest = Number(overrides?.invest ?? engine.allocInvestRaw) || 0;
  const allocEmergency = Number(overrides?.emergency ?? engine.allocEmergencyRaw) || 0;
  const allocLifestyle = Math.max(0, (engine.remaining || 0) - allocLoan - allocInvest - allocEmergency - (engine.bigMonthly || 0));

  // React to sliders natively setting strategy
  const activeExtraEmi = Math.round(allocLoan * 0.7) || 0;
  const activeLumpSum = Math.max(0, allocLoan - activeExtraEmi) || 0;
  const activeWithStrat = useMemo(() => simulateLoan(principal, rate, emi, activeExtraEmi), [principal, rate, emi, activeExtraEmi]);
  const interestSaved = Math.max(0, (engine.without?.totalInterest || 0) - (activeWithStrat?.totalInterest || 0));
  const tenureReduced = Math.max(0, Math.round(((engine.without?.tenure || 0) - (activeWithStrat?.tenure || 0)) * 10) / 10);

  const setAllocDirect = useCallback((key: "loan" | "invest" | "emergency", val: number) => {
    const cur = overrides ?? { loan: engine.allocLoanRaw, invest: engine.allocInvestRaw, emergency: engine.allocEmergencyRaw };
    const diff = val - cur[key];
    // Simple logic: subtract diff from the largest of the other two
    const keys: ("loan" | "invest" | "emergency")[] = ["loan", "invest", "emergency"];
    const otherKeys = keys.filter(k => k !== key);
    const otherKey = cur[otherKeys[0]] > cur[otherKeys[1]] ? otherKeys[0] : otherKeys[1];
    
    setOverrides({ ...cur, [key]: val, [otherKey]: Math.max(0, cur[otherKey] - diff) });
  }, [overrides, engine]);

  const totalAlloc = allocLoan + allocInvest + allocEmergency + engine.bigMonthly;

  /* 12 month accumulation logic */
  const accumulation = useMemo(() => {
    const P = allocInvest;
    if (P <= 0) return 0;
    const r = 0.12; // 12% avg return
    const i = r / 12;
    const n = 12;
    // FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    return Math.round(P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  }, [allocInvest]);

  const RECOMMENDATIONS = [
    {
      name: "HDFC Top 100 Fund",
      type: "MUTUAL FUND",
      desc: "Invests in India's 100 biggest companies. Safe and steady.",
      url: "https://www.indiabulls.com/mutual-funds/hdfc-top-100-fund"
    },
    {
      name: "Parag Parikh Flexi Cap",
      type: "MUTUAL FUND",
      desc: "A smart mix of Indian leaders and global giants like Google/Microsoft.",
      url: "https://www.indiabulls.com/mutual-funds/parag-parikh-flexi-cap"
    },
    {
      name: "HDFC ELSS Fund",
      type: "ELSS",
      desc: "The tax-saver. Grow your money while reducing your income tax.",
      url: "https://www.indiabulls.com/mutual-funds/hdfc-elss-tax-saver"
    }
  ];

  function FundCard({ fund }: { fund: typeof RECOMMENDATIONS[0] }) {
    return (
      <a href={fund.url} target="_blank" rel="noopener noreferrer" className="block p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors bg-white hover:bg-blue-50/30">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-semibold text-slate-900 text-sm">{fund.name}</h4>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">{fund.type}</span>
        </div>
        <p className="text-xs text-slate-500">{fund.desc}</p>
      </a>
    );
  }

  /* pie data */
  const PIE_COLORS = {
    emergency: "#FBBF24",
    loan: "#22C55E",
    invest: "#3B82F6",
    lifestyle: "#EC4899",
    bigexp: "#F97316",
  };
  const pieData = [
    { name: "Emergency Fund", value: Math.max(0, Number(allocEmergency) || 0), color: PIE_COLORS.emergency },
    { name: "Loan Prepayment", value: Math.max(0, Number(allocLoan) || 0), color: PIE_COLORS.loan },
    { name: "Investments", value: Math.max(0, Number(allocInvest) || 0), color: PIE_COLORS.invest },
    { name: "Lifestyle", value: Math.max(0, Number(allocLifestyle) || 0), color: PIE_COLORS.lifestyle },
    ...((engine?.bigMonthly || 0) > 0 ? [{ name: "Big Expense Fund", value: Number(engine.bigMonthly), color: PIE_COLORS.bigexp }] : []),
  ].filter(d => d.value > 0);

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
                    className="space-y-4"
                  >
                    <div className="space-y-2 pb-4 border-b border-slate-50">
                      {[
                        ["Loan Amount", fmt(principal)],
                        ["Interest Rate (p.a.)", `${rate}%`],
                        ["Total Tenure", `${tenure} years`],
                        ["EMI", fmt(emi)],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">{l}</span>
                          <span className="text-sm font-semibold text-slate-900 tabular-nums">{v}</span>
                        </div>
                      ))}
                    </div>
                    
                    <LabeledSlider 
                      label="Years Completed" 
                      display={`${yearsPassed} yrs`} 
                      value={yearsPassed} 
                      onDirectChange={setYearsPassed}
                    >
                      <Slider value={[yearsPassed]} min={0} max={tenure} step={1} onValueChange={([v]) => setYearsPassed(v)} />
                    </LabeledSlider>
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
                    <LabeledSlider label="Years Completed" display={`${yearsPassed} yrs`} value={yearsPassed} onDirectChange={setYearsPassed}>
                      <Slider value={[yearsPassed]} min={0} max={tenure} step={1} onValueChange={([v]) => setYearsPassed(v)} />
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
                      value={income}
                      onDirectChange={setIncome}
                    >
                      <Slider value={[income]} min={20000} max={500000} step={1000} onValueChange={([v]) => setIncome(v)} />
                    </LabeledSlider>
                    
                    <LabeledSlider
                      label="Monthly Expenses"
                      subtitle="Rent, Groceries, Bills, etc."
                      display={fmt(expenses)}
                      badge={`${Math.round(((expenses + obligations) / income) * 100)}%`}
                      value={expenses}
                      onDirectChange={setExpenses}
                    >
                      <Slider value={[expenses]} min={1000} max={300000} step={1000} onValueChange={([v]) => setExpenses(v)} />
                    </LabeledSlider>

                    <LabeledSlider
                      label="Monthly Obligations"
                      subtitle="EMIs, Subscriptions, Insurance, etc."
                      display={fmt(obligations)}
                      badge={`${Math.round((obligations / income) * 100)}%`}
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
                          <div className="space-y-1.5">
                             <p className="text-xs text-slate-500 font-medium">Goal Name</p>
                             <input 
                               type="text" 
                               value={bigLabel} 
                               onChange={(e) => setBigLabel(e.target.value)}
                               placeholder="e.g. Wedding, Car, Travel"
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                             />
                          </div>
                          <LabeledSlider label="Amount needed" display={fmt(bigAmount)} value={bigAmount} onDirectChange={setBigAmount}>
                            <Slider value={[bigAmount]} min={50000} max={2000000} step={10000}
                              onValueChange={([v]) => setBigAmount(v)} />
                          </LabeledSlider>
                          <div>
                            <p className="text-xs text-slate-500 mb-2">Timeline</p>
                            <Chips options={["3", "6", "12", "24"]} value={bigMonths} onChange={setBigMonths} />
                            <p className="text-xs text-slate-400 mt-1.5">
                               ≈ {fmt(Math.round(bigAmount / (parseInt(bigMonths) || 1)))} / month
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
                <div>
                  <h2 className="text-slate-900 font-extrabold text-xl">Your Smart Financial Strategy</h2>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${engine.financialMode === "Strong" ? "bg-green-100 text-green-700" :
                  engine.financialMode === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                  {engine.financialMode} Structure
                </span>
              </div>

              {/* ── ZONE 1: Summary Grid ── */}
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    label="Loan Balance"
                    value={fmt(principal)}
                    subtext={`${engine.remainingTenure} Years Left`}
                  />
                  <MetricCard
                    label="Monthly Income"
                    value={fmt(income)}
                    subtext={`EMI: ${fmt(emi)}`}
                  />
                  <MetricCard
                    label="Total Outgoing"
                    value={fmt(engine.totalOutgoing)}
                    subtext={`${Math.round((engine.totalOutgoing / income) * 100)}% of income`}
                  />
                  <MetricCard
                    label="Free Cash"
                    value={`${fmt(engine.freeCash)}/ month`}
                    subtext="EMI + Expenses + Invest"
                  />
                </div>
                
                <CoachInsightCard insight={engine.trustMsg} />
              </div>

              {/* ── ZONE 2: The Playground ── */}
              {!engine.isNegative && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Monthly Allocation Card */}
                  <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monthly Allocation</p>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase tracking-widest">Your Playground</span>
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <AllocationStepper
                        label="Emergency Buffer"
                        value={allocEmergency}
                        onChange={v => setAllocDirect("emergency", v)}
                        max={engine.remaining}
                        color={PIE_COLORS.emergency}
                      />
                      <AllocationStepper
                        label="Loan Optimisation"
                        value={allocLoan}
                        onChange={v => setAllocDirect("loan", v)}
                        max={engine.remaining}
                        color={PIE_COLORS.loan}
                      />
                      <AllocationStepper
                          label="Strategic Investments"
                          value={allocInvest}
                          onChange={(v) => setAllocDirect("invest", v)}
                          max={engine.remaining}
                          color="#3B82F6"
                        />

                        {/* Upcoming Goal Fund (Priority) */}
                        {hasBigExpense && (
                          <div className="pt-2 border-t border-slate-100">
                             <div className="py-3 opacity-80">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-orange-500" />
                                    <span className="text-sm font-bold text-slate-700">Big Expense Fund</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-white/50 border border-slate-100 flex items-center justify-center">
                                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                    <div className="w-24 h-8 text-slate-400 font-black text-sm text-center flex items-center justify-center tabular-nums">
                                      {fmt(engine.bigMonthly)}
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/50 border border-slate-100 flex items-center justify-center">
                                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-right">
                                  Capped at 60% of surplus
                                </p>
                             </div>
                          </div>
                        )}
                      </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-400">Total distributed</span>
                        <span className="text-sm font-black text-slate-900 tabular-nums">{fmt(allocLoan + allocInvest + allocEmergency)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-400">Cash Available for Lifestyle</span>
                        <span className="text-sm font-black text-slate-900 tabular-nums">{fmt(allocLifestyle)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Split Card */}
                  <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 self-start mb-4">Allocation Split</p>
                    <div className="h-44 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData.filter(d => d.value > 0)} 
                            cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                            paddingAngle={4} dataKey="value" strokeWidth={0} animationDuration={500}
                          >
                            {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan</p>
                          <p className="text-lg font-black text-slate-900 tracking-tight">{fmtL(allocLoan + allocInvest + allocEmergency)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full">
                       {pieData.filter(d => d.value > 0).map(d => (
                         <div key={d.name} className="flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{d.name}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ZONE 3 & 4: side-by-side layout ── */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* ── ZONE 3: Recommendation & Strategies ── */}
                {!engine.isNegative && (
                  <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Recommendation & Strategies</p>
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        According to your allocations, we recommend Monthly Prepayments + these investment options
                      </p>
                    </div>

                    <div className="space-y-4 flex-1">
                      {/* Step 1: Loan Strategy */}
                      <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="flex gap-4 relative z-10">
                          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 font-black text-sm shadow-sm">1</div>
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 mb-2">How to finish your loan faster</h4>
                            <div className="space-y-2.5">
                              <div className="bg-white/80 p-3 rounded-xl border border-green-100">
                                <p className="text-[13px] font-black text-slate-900 tracking-tight">Pay {fmt(emi + Math.round(allocLoan * 0.7))} every month</p>
                                <p className="text-[11px] text-green-700 font-medium mt-0.5">Instead of your usual {fmt(emi)} EMI. This extra {fmt(Math.round(allocLoan * 0.7))} reduces your balance directly.</p>
                              </div>
                              <div className="bg-white/80 p-3 rounded-xl border border-green-100">
                                <p className="text-[13px] font-black text-slate-900 tracking-tight">Save {fmt(Math.round(allocLoan * 0.3))} for a bonus payment</p>
                                <p className="text-[11px] text-green-700 font-medium mt-0.5">By the end of the year, you'll have {fmt(Math.round(allocLoan * 0.3) * 12)} to pay off a big piece at once.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Investment Options */}
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-5 relative overflow-hidden">
                        <div className="flex gap-4 relative z-10">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-black text-sm shadow-sm">2</div>
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900">Growing your wealth</h4>
                            <p className="text-[11px] text-blue-700 font-bold mt-1.5 leading-relaxed">
                              Investing {fmt(allocInvest)} every month. At a standard 12% return, your money could grow to ≈ {fmt(accumulation)} in just one year!
                            </p>
                          </div>
                        </div>

                        {/* Fund List - Vertical for side-by-side layout */}
                        <div className="flex flex-col gap-2">
                           {RECOMMENDATIONS.map(fund => (
                             <FundCard key={fund.name} fund={fund} />
                           ))}
                        </div>
                      </div>

                      {/* Step 3: Big Goal Fund (Conditional) */}
                      {hasBigExpense && (
                         <div className={`border-2 rounded-2xl p-5 relative overflow-hidden transition-all ${engine.isSafetyBridge ? "bg-red-50 border-red-200" : "bg-orange-50/50 border-orange-100"}`}>
                          <div className="flex gap-4 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm shadow-sm transition-colors ${engine.isSafetyBridge ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                              {engine.isSafetyBridge ? <AlertTriangle className="w-5 h-5" /> : "3"}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-black text-slate-900 mb-1">
                                {engine.isSafetyBridge ? "Safety Bridge: " : ""}Your "{bigLabel || "Future"}" Goal
                              </h4>
                              <p className={`text-[11px] font-bold leading-relaxed transition-colors ${engine.isSafetyBridge ? "text-red-700" : "text-orange-700"}`}>
                                {engine.isSafetyBridge 
                                  ? `We've slowed this down to ${fmt(engine.bigMonthly)}/mo to build your safety net first. Safety is non-negotiable.` 
                                  : (
                                    <>
                                      Save {fmt(engine.bigMonthly)} every month for exactly {bigMonths} months. You'll have ≈ {fmt(engine.bigMonthly * (parseInt(bigMonths) || 1))} ready.
                                      { (engine.bigMonthly * (parseInt(bigMonths) || 1)) < Number(bigAmount) && (
                                        <span className="block mt-1 opacity-80 font-medium italic">
                                          ✨ Still a shortage of {fmt(Number(bigAmount) - (engine.bigMonthly * (parseInt(bigMonths) || 1)))} because pouring more than 60% isn't healthy!
                                        </span>
                                      )}
                                    </>
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── ZONE 4: Long-Term Impact ── */}
                {!engine.isNegative && (
                  <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col">
                    <div>
                      <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-[0.2em] mb-1">Long-Term Impact</p>
                      <h2 className="text-slate-900 font-black text-2xl tracking-tight">The Path to Freedom</h2>
                    </div>

                    {/* The Path to Freedom Graph */}
                    <div className="w-full relative h-[300px]">
                      <PayoffChart 
                        original={{ ...engine.without, schedule: engine.without.schedule }} 
                        optimized={{ ...activeWithStrat, schedule: activeWithStrat.schedule }} 
                        symbol="₹" 
                        hideHeader
                      />
                    </div>

                    {/* Impact Metric Cards - Grid for side-by-side */}
                    <div className="grid grid-cols-1 gap-3 flex-1">
                      <div className="bg-green-50/40 border border-green-100 p-4 rounded-2xl">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Tenure Reduced</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{tenureReduced} years</p>
                      </div>

                      <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Interest Saved</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{fmt(interestSaved)}</p>
                      </div>

                      <div className="bg-red-50/40 border border-red-100 p-4 rounded-2xl">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Investments</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{fmt(accumulation)}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">In 12 months @ 12%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <div className="flex flex-col">
          <label className="text-sm font-black text-slate-700">{label}</label>
          {subtitle && <p className="text-[11px] text-slate-400 font-bold leading-tight mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge && <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{badge}</span>}
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
