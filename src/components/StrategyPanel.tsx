import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  Plus,
  Zap,
  RefreshCw,
  Percent,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { StrategyConfig } from "@/lib/loan-calculations";
import type { LoanInput } from "@/lib/loan-calculations";
import { cn } from "@/lib/utils";

interface StrategyPanelProps {
  strategy: StrategyConfig;
  updateStrategy: (p: Partial<StrategyConfig>) => void;
  symbol: string;
  emi?: number;
  loanInput?: LoanInput;
}

export function StrategyPanel({ strategy, updateStrategy, symbol, emi = 0, loanInput }: StrategyPanelProps) {
  const navigate = useNavigate();
  const strategies = [
    {
      key: "stepUp" as const,
      label: "Step-Up EMI",
      description:
        "Increase your payment a little each year as your salary grows. Pays off faster without straining you now.",
      icon: <TrendingUp className="h-4 w-4" />,
      enabled: strategy.stepUpEnabled,
      onToggle: (v: boolean) => updateStrategy({ stepUpEnabled: v }),
      control: (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Bump it up by</span>
            <span className="font-mono text-foreground">{strategy.stepUpPercent}% / year</span>
          </div>
          <Slider
            value={[strategy.stepUpPercent]}
            onValueChange={([v]) => updateStrategy({ stepUpPercent: v })}
            min={1}
            max={25}
            step={1}
          />
        </div>
      ),
    },
    {
      key: "annualLumpSum" as const,
      label: "Annual Prepayment",
      description:
        "Put your yearly bonus directly into your loan. Even one lump sum a year makes a surprising difference.",
      icon: <Calendar className="h-4 w-4" />,
      enabled: strategy.annualLumpSumEnabled,
      onToggle: (v: boolean) => updateStrategy({ annualLumpSumEnabled: v }),
      control: (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Drop this every year</span>
            <span className="font-mono text-foreground">{symbol}{strategy.annualLumpSum.toLocaleString("en-IN")}</span>
          </div>
          <Slider
            value={[strategy.annualLumpSum]}
            onValueChange={([v]) => updateStrategy({ annualLumpSum: v })}
            min={10000}
            max={2000000}
            step={10000}
          />
        </div>
      ),
    },
    {
      key: "extraEmi" as const,
      label: "One Extra EMI Per Year",
      description:
        "Pay 13 EMIs instead of 12 each year. That one extra payment quietly chips away at your loan.",
      icon: <Plus className="h-4 w-4" />,
      enabled: strategy.extraEmiEnabled,
      onToggle: (v: boolean) => updateStrategy({ extraEmiEnabled: v }),
      control: null,
    },
    {
      key: "oneTime" as const,
      label: "One-Time Lump Sum",
      description:
        "Got a windfall — a gift, sale, or bonus? Dropping it on your loan at the right time can save you a lot.",
      icon: <Zap className="h-4 w-4" />,
      enabled: strategy.oneTimeEnabled,
      onToggle: (v: boolean) => updateStrategy({ oneTimeEnabled: v }),
      control: (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Strike at year</span>
              <span className="font-mono text-foreground">{Math.round(strategy.oneTimeMonth / 12 * 10) / 10}</span>
            </div>
            <Slider
              value={[strategy.oneTimeMonth]}
              onValueChange={([v]) => updateStrategy({ oneTimeMonth: v })}
              min={12}
              max={360}
              step={12}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">How much</span>
              <span className="font-mono text-foreground">{symbol}{strategy.oneTimeAmount.toLocaleString("en-IN")}</span>
            </div>
            <Slider
              value={[strategy.oneTimeAmount]}
              onValueChange={([v]) => updateStrategy({ oneTimeAmount: v })}
              min={10000}
              max={5000000}
              step={10000}
            />
          </div>
        </div>
      ),
    },
    {
      key: "roundUp" as const,
      label: "Monthly Top-Up",
      description:
        "Add a fixed extra amount every month. Even ₹2,000 extra can shave years off a 20-year loan.",
      icon: <Percent className="h-4 w-4" />,
      enabled: strategy.roundUpEnabled,
      onToggle: (v: boolean) => updateStrategy({ roundUpEnabled: v }),
      control: (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Add this much</span>
            <span className="font-mono text-foreground">{symbol}{strategy.roundUpAmount.toLocaleString("en-IN")}</span>
          </div>
          <Slider
            value={[strategy.roundUpAmount]}
            onValueChange={([v]) => updateStrategy({ roundUpAmount: v })}
            min={500}
            max={50000}
            step={500}
          />
        </div>
      ),
    },
    {
      key: "refinance" as const,
      label: "Refinance Check",
      description:
        "Wondering if a lower rate in the future is worth switching? See the math before you decide.",
      icon: <RefreshCw className="h-4 w-4" />,
      enabled: strategy.refinanceEnabled,
      onToggle: (v: boolean) => updateStrategy({ refinanceEnabled: v }),
      control: (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">New rate</span>
              <span className="font-mono text-foreground">{strategy.refinanceRate.toFixed(1)}% p.a.</span>
            </div>
            <Slider
              value={[strategy.refinanceRate]}
              onValueChange={([v]) => updateStrategy({ refinanceRate: Math.round(v * 10) / 10 })}
              min={1}
              max={20}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Switch at year</span>
              <span className="font-mono text-foreground">{Math.round(strategy.refinanceMonth / 12 * 10) / 10}</span>
            </div>
            <Slider
              value={[strategy.refinanceMonth]}
              onValueChange={([v]) => updateStrategy({ refinanceMonth: v })}
              min={12}
              max={360}
              step={12}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-3"
    >
      {strategies.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 * i }}
          className={cn(
            "bg-card border-2 rounded-2xl p-5 transition-all duration-300 cursor-pointer group",
            s.enabled
              ? "border-primary shadow-lg shadow-primary/10 bg-primary/5"
              : "border-border hover:border-primary/50 hover:shadow-md"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-colors duration-200 ${s.enabled
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-500"
                  }`}
              >
                {s.icon}
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-900">{s.label}</Label>
                <p className="text-xs text-slate-500 leading-snug max-w-[260px]">{s.description}</p>
              </div>
            </div>
            <Switch checked={s.enabled} onCheckedChange={s.onToggle} />
          </div>
          <AnimatePresence>
            {s.enabled && s.control && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2">{s.control}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Get your full money plan CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.35 }}
        className="relative overflow-hidden rounded-2xl cursor-pointer group"
        onClick={() => {
          const params = new URLSearchParams();
          if (loanInput) {
            params.set("principal", String(loanInput.principal));
            params.set("rate", String(loanInput.annualRate));
            params.set("tenure", String(loanInput.tenureYears));
            params.set("emi", String(emi));
          }
          navigate(`/financialcoach?${params.toString()}`);
        }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" />
        {/* Subtle glow orbs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl" />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-200">
              Smart Engine
            </span>
          </div>

          <h3 className="text-xl font-bold text-white leading-tight mb-2">
            Get your full money plan
          </h3>
          <p className="text-sm text-blue-100 leading-relaxed mb-5">
            We'll tell you how to split{emi > 0 ? ` your savings` : " your money"} across:<br />
            <span className="font-semibold text-white">Loan &bull; Investment &bull; Lifestyle</span>
          </p>

          <div className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold text-sm px-5 py-2.5 rounded-xl
                          group-hover:bg-blue-50 group-hover:gap-3 transition-all duration-200 shadow-lg">
            Build my Plan
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
