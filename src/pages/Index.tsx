import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLoanCalculator } from "@/hooks/use-loan-calculator";
import { InputPanel } from "@/components/InputPanel";
import { SummaryCards } from "@/components/SummaryCards";
import { CompositionBar } from "@/components/CompositionBar";
import { AmortizationChart } from "@/components/AmortizationChart";
import { PayoffChart } from "@/components/PayoffChart";
import { StrategyPanel } from "@/components/StrategyPanel";
import { AmortizationTable } from "@/components/AmortizationTable";
import { EMIHeroSection } from "@/components/EMIHeroSection";
import { SEO } from "@/components/SEO";
import { Calculator, ChevronDown, TableProperties, Lightbulb, HandCoins, ChartNoAxesColumn, TrendingDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";


const Index = () => {
  const calc = useLoanCalculator();
  const principalPercent = (calc.input.principal / calc.original.totalPaid) * 100;
  const interestPercent = 100 - principalPercent;
  const [isCalculated, setIsCalculated] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        {/* Absolute Header */}
        <header className="absolute top-0 w-full z-50 bg-transparent">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <img src="/icon.png" alt="Know My EMI Logo" className="h-[56px] w-auto drop-shadow-sm" />
            </motion.div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Home</a>
            <a href="/financialcoach" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Financial Coach</a>
          </nav>

        </div>
      </header>

      <EMIHeroSection
        onCalculateClick={() => scrollTo("calculate")}
        onLearnClick={() => scrollTo("strategize")}
      />

      <main className="container max-w-7xl mx-auto px-4 pt-2 pb-8 md:pt-4 md:pb-16" role="main">
        {/* Section 1 — Calculate */}
        <article id="calculate" className="scroll-mt-20">
          <SectionHeader
            step={1}
            icon={<Calculator className="h-5 w-5" />}
            title="Let's figure out your monthly payments"
            subtitle="Enter your loan details and we'll calculate everything in real time — no surprises, just clarity."
            color="text-principal"
          />

          <div className="grid lg:grid-cols-12 gap-6 mt-6 items-start">
            <div className={cn(
              "transition-all duration-700 ease-in-out lg:col-span-4",
              !isCalculated && "lg:col-span-12 max-w-2xl mx-auto w-full"
            )}>
              <InputPanel
                input={calc.input}
                updateInput={calc.updateInput}
                currency={calc.currency}
                setCurrency={calc.setCurrency}
                loanType={calc.loanType}
                setLoanType={calc.setLoanType}
                isCalculated={isCalculated}
                onCalculate={() => setIsCalculated(true)}
              />
            </div>
            <AnimatePresence>
              {isCalculated && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ type: "tween", duration: 0.5, ease: "easeOut" }}
                  className="lg:col-span-8 space-y-6"
                >
                  <SummaryCards
                    emi={calc.emi}
                    result={calc.original}
                    symbol={calc.currency.symbol}
                  />
                  <CompositionBar principalPercent={principalPercent} />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "tween", duration: 0.4, ease: "easeOut", delay: 1.0 }}
                    className="relative overflow-hidden rounded-2xl px-4 sm:px-6 py-4 sm:py-5 bg-blue-600 shadow-md mt-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                      <div className="space-y-2 flex-1">
                        <Badge className="mb-2 sm:mb-3 bg-white/20 text-white border-white/30 hover:bg-white/20">
                          💡 YOU COULD SAVE Lakhs
                        </Badge>
                        <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                          That's a lot of interest. Want to cut it down?
                        </h3>
                        <p className="text-xs sm:text-[13px] text-blue-100">
                          See how small changes save you lakhs.
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                        <TrendingDown
                          className="text-blue-300 hidden sm:block"
                          style={{ width: 48, height: 48 }}
                          aria-hidden="true"
                        />
                        <button
                          onClick={() => scrollTo("strategize")}
                          className="bg-white text-blue-600 font-bold text-xs sm:text-[13px] px-4 sm:px-5 py-2 rounded-lg
                                     hover:bg-blue-50 transition-colors duration-200 cursor-pointer whitespace-nowrap
                                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white w-full sm:w-auto text-center"
                        >
                          Show me how to save →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </article>

        {/* Year-by-Year Amortization */}
        {isCalculated && (
          <>
            <div className="mt-8">
              <div className="grid lg:grid-cols-2 gap-6">
                <AmortizationChart
                  data={calc.original.yearlyBreakdown}
                  symbol={calc.currency.symbol}
                />
                <PayoffChart
                  original={calc.original}
                  optimized={calc.optimized}
                  symbol={calc.currency.symbol}
                />
              </div>

              <CollapsibleSchedule
                yearlyBreakdown={calc.original.yearlyBreakdown}
                schedule={calc.original.schedule}
                symbol={calc.currency.symbol}
              />
            </div>

            <SectionDivider />
          </>
        )}

        {/* Section 2 — Strategize (USP) */}
        {isCalculated && (
          <article id="strategize" className="scroll-mt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Your Payoff Strategies
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Pay less interest. Finish sooner.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              You've seen the numbers — now let's improve them. Toggle any strategy below to instantly see how much you'd save.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <div className="min-w-0">
              <StrategyPanel
                strategy={calc.strategy}
                updateStrategy={calc.updateStrategy}
                symbol={calc.currency.symbol}
                emi={calc.emi}
                loanInput={calc.input}
              />
            </div>
            <div className="space-y-4 min-w-0">
              {calc.isStrategyActive && calc.optimized && calc.savings && (
                <>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500">
                      Here's what your current strategy saves you
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Interest Saved */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6"
                      >
                        <p className="text-xs sm:text-sm font-medium text-green-700 uppercase tracking-wide">
                          Interest Saved
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mt-1.5 sm:mt-2 leading-tight break-words">
                          {calc.currency.symbol}{Math.round(calc.savings.interestSaved).toLocaleString("en-IN")}
                        </p>
                      </motion.div>

                      {/* Time Saved */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.075 }}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6"
                      >
                        <p className="text-xs sm:text-sm font-medium text-blue-700 uppercase tracking-wide">
                          Time Saved
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mt-1.5 sm:mt-2 leading-tight">
                          {calc.savings.yearsSaved} yrs
                        </p>
                      </motion.div>
                    </div>
                  </div>
                  <PayoffChart
                    original={calc.original}
                    optimized={calc.optimized}
                    symbol={calc.currency.symbol}
                  />
                  <AmortizationTable
                    yearlyBreakdown={calc.optimized.yearlyBreakdown}
                    schedule={calc.optimized.schedule}
                    symbol={calc.currency.symbol}
                    title="Your optimized game plan"
                    variant="optimized"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
                    className="glass-card rounded-2xl p-5 space-y-3 border-l-4 border-highlight"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-highlight" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Financial Intelligence
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Early payments are mostly{" "}
                      <span className="text-interest font-semibold">interest</span>, not principal.
                      Paying a little extra in the first few years can save you{" "}
                      <span className="text-principal font-semibold">far more</span> than
                      the same amount paid later. The earlier you act, the bigger the impact.
                    </p>
                  </motion.div>
                </>
              )}
              {!calc.isStrategyActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[260px]"
                >
                  <motion.div
                    className="p-4 rounded-2xl bg-muted"
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ChartNoAxesColumn className="h-10 w-10 text-muted-foreground/50" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Ready when you are</p>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                      Enable a strategy on the left to see how much interest you could save and how much sooner you'd be debt-free.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          </article>
        )}
      </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/30">
          <div className="container max-w-7xl mx-auto px-4 py-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <HandCoins className="h-3.5 w-3.5" />
              <p>Professional financial intelligence for informed loan decisions</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

/* ── Subcomponents ── */

function SectionHeader({
  step,
  icon,
  title,
  subtitle,
  color,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="flex items-start gap-4"
    >
      <motion.div
        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-muted ${color}`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {icon}
      </motion.div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Step {step}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-lg">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-10 md:my-14">
      <div className="flex-1 h-px bg-border/60" />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

function CollapsibleSchedule({
  yearlyBreakdown,
  schedule,
  symbol,
}: {
  yearlyBreakdown: any[];
  schedule: any[];
  symbol: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl mt-6 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <TableProperties className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground flex-shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Complete Amortization Schedule</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Detailed monthly breakdown of principal and interest allocation</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-0 sm:px-5 pb-3 sm:pb-5"
        >
          <AmortizationTable
            yearlyBreakdown={yearlyBreakdown}
            schedule={schedule}
            symbol={symbol}
            title=""
            variant="original"
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default Index;
