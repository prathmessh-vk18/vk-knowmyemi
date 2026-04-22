import { BookOpen, Calculator, Scale, Lightbulb, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Is the interest earned on FDs taxable?",
    a: "Yes. FD interest is fully taxable as per your income tax slab. Banks deduct TDS at 10% if interest exceeds ₹40,000 per year (₹50,000 for senior citizens). You can submit Form 15G/15H to avoid TDS if your total income is below the taxable limit.",
  },
  {
    q: "Can I withdraw my FD before maturity?",
    a: "Yes, most banks allow premature withdrawal but charge a penalty of 0.5%–1% on the applicable interest rate. Tax-saver FDs (5-year lock-in) cannot be withdrawn early.",
  },
  {
    q: "Do senior citizens get higher FD rates?",
    a: "Yes. Senior citizens (60+) typically get an extra 0.25%–0.75% over standard FD rates across most Indian banks.",
  },
  {
    q: "What is FD laddering?",
    a: "FD laddering is splitting your investment across multiple FDs of different tenures (e.g., 1, 2, 3 years). This gives you periodic liquidity while still earning competitive long-term rates.",
  },
  {
    q: "Are FDs safe?",
    a: "FDs in scheduled banks are insured up to ₹5 lakh per depositor per bank under DICGC. For amounts above this, consider spreading deposits across multiple banks.",
  },
];

export const ArticleBody = () => {
  return (
    <article className="prose-content space-y-12 max-w-3xl">
      {/* What is FD */}
      <section id="what-is-fd" className="scroll-mt-24">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" /> Basics
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          What is a Fixed Deposit?
        </h2>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          A Fixed Deposit (FD) is a savings instrument offered by banks and NBFCs where you
          deposit a lump sum for a fixed period at a guaranteed interest rate. Unlike a savings
          account, the rate doesn't change for your tenure — what you see at the time of booking
          is exactly what you get at maturity.
        </p>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          FDs are ideal for risk-averse investors, anyone parking short-to-medium term goals
          (1–5 years), or those building an emergency buffer that earns more than a savings account.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary">•</span> Capital is protected — DICGC insurance covers up to ₹5 lakh per bank.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> Returns are predictable — no market risk.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> Flexible tenures from 7 days to 10 years.</li>
        </ul>
      </section>

      {/* How calculated */}
      <section id="how-calculated" className="scroll-mt-24">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
          <Calculator className="h-3.5 w-3.5" /> The math
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          How FD interest is calculated
        </h2>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Most Indian banks compound FD interest <strong className="text-foreground">quarterly</strong>.
          The formula is:
        </p>
        <div className="mt-4 rounded-xl bg-secondary p-5 font-mono text-sm text-foreground">
          A = P × (1 + r/n)<sup>n×t</sup>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li><strong className="text-foreground">A</strong> = maturity amount</li>
          <li><strong className="text-foreground">P</strong> = principal (the amount you deposit)</li>
          <li><strong className="text-foreground">r</strong> = annual interest rate (as a decimal)</li>
          <li><strong className="text-foreground">n</strong> = compounding frequency per year (4 for quarterly)</li>
          <li><strong className="text-foreground">t</strong> = tenure in years</li>
        </ul>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Example: ₹5,00,000 at 7% for 5 years compounded quarterly grows to roughly ₹7,07,000.
          The calculator above uses the same formula — try changing the inputs to see how each variable
          affects your final corpus.
        </p>
      </section>

      {/* FD vs others */}
      <section id="fd-vs-mf-sip" className="scroll-mt-24">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
          <Scale className="h-3.5 w-3.5" /> Comparison
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          FD vs Mutual Funds vs SIP: which one is right for you?
        </h2>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Each instrument serves a different purpose. Here's a quick decision frame:
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3 font-semibold">Factor</th>
                <th className="p-3 font-semibold">Fixed Deposit</th>
                <th className="p-3 font-semibold">Mutual Fund</th>
                <th className="p-3 font-semibold">SIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr><td className="p-3 font-medium text-foreground">Returns</td><td className="p-3 text-muted-foreground">6–8%</td><td className="p-3 text-muted-foreground">10–14%</td><td className="p-3 text-muted-foreground">10–12%</td></tr>
              <tr><td className="p-3 font-medium text-foreground">Risk</td><td className="p-3 text-muted-foreground">Very low</td><td className="p-3 text-muted-foreground">Market-linked</td><td className="p-3 text-muted-foreground">Market-linked</td></tr>
              <tr><td className="p-3 font-medium text-foreground">Liquidity</td><td className="p-3 text-muted-foreground">Penalty on early exit</td><td className="p-3 text-muted-foreground">High (T+1/T+3)</td><td className="p-3 text-muted-foreground">High</td></tr>
              <tr><td className="p-3 font-medium text-foreground">Best for</td><td className="p-3 text-muted-foreground">Short-term goals</td><td className="p-3 text-muted-foreground">Wealth building</td><td className="p-3 text-muted-foreground">Disciplined investing</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          A balanced portfolio often holds <strong className="text-foreground">both</strong> — FDs for safety and short-term needs,
          mutual funds and SIPs for long-term wealth creation that beats inflation.
        </p>
      </section>

      {/* Tips */}
      <section id="tips" className="scroll-mt-24">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
          <Lightbulb className="h-3.5 w-3.5" /> Strategies
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Tips to get more from your FD
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {[
            { t: "Ladder your deposits", d: "Split into 3–5 FDs of different tenures so you always have one maturing soon." },
            { t: "Compare bank rates", d: "Small finance banks often offer 1–1.5% higher than large PSU banks for the same tenure." },
            { t: "Use cumulative option", d: "Reinvest interest instead of taking payouts — compounding does the heavy lifting." },
            { t: "Consider tax-saver FDs", d: "Get up to ₹1.5 lakh deduction under Section 80C, but expect a 5-year lock-in." },
            { t: "Senior citizen rates", d: "If a parent qualifies, book FDs in their name for an extra 0.5% rate." },
            { t: "Don't lock everything", d: "Keep 20–30% liquid in savings or liquid funds for emergencies." },
          ].map((tip) => (
            <div key={tip.t} className="rounded-xl bg-accent/60 p-4">
              <p className="text-sm font-bold text-foreground">{tip.t}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-snug">{tip.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="scroll-mt-24">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="h-3.5 w-3.5" /> FAQs
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-5 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3 text-base font-semibold text-foreground">
                {f.q}
                <span className="text-primary text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </article>
  );
};
