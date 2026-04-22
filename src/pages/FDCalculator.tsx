import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CalendarDays, Clock } from "lucide-react";
import { PlanPanel } from "@/components/calculators-fd/PlanPanel";
import { GrowthChart } from "@/components/calculators-fd/GrowthChart";
import { InsightCard } from "@/components/calculators-fd/InsightCard";
import { MilestoneTimeline } from "@/components/calculators-fd/MilestoneTimeline";
import { WhatThisMeans } from "@/components/calculators-fd/WhatThisMeans";
import { ComparisonChart } from "@/components/calculators-fd/ComparisonChart";
import { AlternateOptions } from "@/components/calculators-fd/AlternateOptions";
import { AnimatedAmount } from "@/components/calculators-fd/AnimatedAmount";
import { Breadcrumbs } from "@/components/calculators-blog/Breadcrumbs";
import { TableOfContents } from "@/components/calculators-blog/TableOfContents";
import { ArticleBody } from "@/components/calculators-blog/ArticleBody";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import {
  buildYearlySeries,
  effectiveAnnualGrowth,
  fdMaturity,
  formatINR,
  inflationAdjusted,
} from "@/lib/finance";

const FDCalculator = () => {
  const [amount, setAmount] = useState(500000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(7);

  const final = useMemo(() => fdMaturity(amount, rate, years), [amount, rate, years]);
  const interest = final - amount;
  const series = useMemo(
    () => buildYearlySeries(amount, rate, years),
    [amount, rate, years],
  );
  const cagr = effectiveAnnualGrowth(amount, final, years);
  const realValue = inflationAdjusted(final, 6, years);

  return (
    <main className="min-h-screen bg-background relative pb-20 overflow-hidden">
      <SEO title="FD Calculator 2026 — KnowMyEMI" description="A free interactive FD calculator with live charts, milestone breakdowns and a complete guide." />
      <Header />

      {/* ── Floating % watermark on page body — scrolls with page ── */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute top-24 right-0 text-[340px] font-black leading-none text-blue-300/20 z-0"
        style={{ lineHeight: 1 }}
      >
        %
      </span>

      {/* ── Page header ── */}
      <header className="relative z-10 container max-w-7xl pt-28 pb-6 mx-auto px-4">
        <Breadcrumbs />
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-3 py-1.5 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Fixed Deposit Calculator
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-slate-900 max-w-3xl">
          Calculate your Fixed Deposit{" "}
          <span className="text-blue-600">returns</span> with confidence.
        </h1>
        <p className="mt-3 text-base md:text-lg text-slate-500 max-w-2xl font-medium">
          A free interactive FD calculator with live charts, milestone breakdowns and a
          complete guide to Fixed Deposits in India — all in one place.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> Updated April 2026
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> 6 min read
          </span>
        </div>
      </header>

      {/* ── Calculator grid ── */}
      <div className="relative z-10 container max-w-7xl pb-16 grid lg:grid-cols-[380px_1fr] gap-5 lg:gap-6 items-start mx-auto px-4">

        {/* LEFT: Input Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:sticky lg:top-24">
          <PlanPanel
            amount={amount}
            years={years}
            rate={rate}
            onAmount={setAmount}
            onYears={setYears}
            onRate={setRate}
          />
        </div>

        {/* RIGHT: Unified elevated result card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[28px] border border-slate-200 shadow-xl overflow-hidden space-y-0"
        >
          {/* ① Hero: chart + headline */}
          <div className="px-6 py-6 border-b border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Your money grows to
            </p>
            <div className="mt-1 text-4xl md:text-5xl font-black tracking-tight text-blue-600">
              <AnimatedAmount value={final} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              You invested{" "}
              <span className="font-semibold text-slate-700">{formatINR(amount)}</span> and
              earned{" "}
              <span className="font-semibold text-blue-600">{formatINR(interest)}</span> in
              returns over{" "}
              <span className="font-semibold text-slate-700">
                {years} {years === 1 ? "year" : "years"}
              </span>.
            </p>

            {/* Growth chart - wrapped in container */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-3 -mx-1">
              <GrowthChart data={series} />
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Your money
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="18" height="4" className="shrink-0">
                  <line x1="0" y1="2" x2="18" y2="2" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
                Invested
              </span>
            </div>
          </div>

          {/* ② Investment Facts — 3 individual cards */}
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Investment Facts
            </p>
            <div className="grid grid-cols-3 gap-3">
              <InsightCard
                label="Total Interest Earned"
                value={formatINR(interest)}
                hint={`Over ${years} ${years === 1 ? "year" : "years"}`}
                tone="growth"
              />
              <InsightCard
                label="Annual CAGR"
                value={`${cagr.toFixed(2)}%`}
                hint="Your real yearly return"
                tone="neutral"
              />
              <InsightCard
                label="Real Value After Inflation"
                value={formatINR(realValue)}
                hint="Adjusted at 6% inflation"
                tone="warn"
              />
            </div>
          </div>

          {/* ③ Year by year journey */}
          <div className="px-6 py-5 border-b border-slate-100">
            <MilestoneTimeline data={series} invested={amount} />
          </div>

          {/* ④ What this could buy — #F8FAFC bg (applied inside WhatThisMeans) */}
          <div className="px-6 py-5 border-b border-slate-100">
            <WhatThisMeans finalAmount={final} />
          </div>

          {/* ⑤ How does FD stack up? — Comparison line chart */}
          <div className="px-6 py-6 border-b border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              How does FD stack up?
            </p>
            <p className="text-sm text-slate-500 font-medium mt-1 mb-5">
              Same money, same time — different paths.
            </p>
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <ComparisonChart amount={amount} years={years} fdRate={rate} />
            </div>
          </div>

          {/* ⑥ Alternate Options to Explore */}
          <div className="px-6 py-6">
            <AlternateOptions />
          </div>

        </motion.section>
      </div>

      {/* ── Blog section ── */}
      <div className="relative z-10 container max-w-7xl mb-16 grid lg:grid-cols-[240px_1fr] gap-6 items-start mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:sticky lg:top-28">
          <TableOfContents />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <ArticleBody />
        </div>
      </div>

      <footer className="relative z-10 container max-w-7xl pb-10 text-center text-xs font-semibold text-slate-400">
        Built for learning · Numbers are illustrative, not financial advice.
      </footer>
    </main>
  );
};

export default FDCalculator;
