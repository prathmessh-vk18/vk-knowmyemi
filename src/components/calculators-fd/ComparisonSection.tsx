import { compoundAnnual, fdMaturity, formatINR } from "@/lib/finance";
import { ShieldCheck, LineChart, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  amount: number;
  years: number;
  fdRate: number;
}

const FUND_PICKS = [
  {
    name: "HDFC Top 100 Fund",
    category: "Large Cap",
    note: "Steady blue-chip exposure from a trusted AMC",
    href: "https://groww.in/mutual-funds/hdfc-top-100-fund-direct-plan-growth",
  },
  {
    name: "Parag Parikh Flexi Cap",
    category: "Flexi Cap",
    note: "Diversified across India + global stocks",
    href: "https://groww.in/mutual-funds/parag-parikh-flexi-cap-fund-direct-growth",
  },
  {
    name: "UTI Nifty 50 Index Fund",
    category: "Index",
    note: "Low-cost passive Nifty 50 tracker",
    href: "https://groww.in/mutual-funds/uti-nifty-50-index-fund-direct-growth",
  },
];

export const ComparisonSection = ({ amount, years, fdRate }: Props) => {
  const fd = fdMaturity(amount, fdRate, years);
  const mf = compoundAnnual(amount, 12, years);
  const sip = compoundAnnual(amount, 10, years);
  const max = Math.max(fd, mf, sip);

  const cards = [
    {
      key: "fd",
      title: "Fixed Deposit",
      rate: `${fdRate}%`,
      value: fd,
      tag: "Safe & predictable",
      icon: ShieldCheck,
      tone: "primary" as const,
    },
    {
      key: "sip",
      title: "Mutual Fund SIP",
      rate: "10%",
      value: sip,
      tag: "Balanced growth",
      icon: LineChart,
      tone: "neutral" as const,
    },
    {
      key: "mf",
      title: "Equity Mutual Fund",
      rate: "12%",
      value: mf,
      tag: "Higher risk, higher reward",
      icon: TrendingUp,
      tone: "growth" as const,
    },
  ];

  return (
    <section className="w-full">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            How does FD stack up?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Same money, same time — different paths.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-warning/10 text-warning px-3 py-1.5 text-xs font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          FD is safe but may not beat inflation
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const pct = Math.round((c.value / max) * 100);
          return (
            <div
              key={c.key}
              className={cn(
                "rounded-2xl border p-5 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card",
                c.tone === "growth" ? "border-primary/40 shadow-soft" : "border-border/60",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full",
                    c.tone === "primary" && "bg-accent text-primary",
                    c.tone === "neutral" && "bg-secondary text-secondary-foreground",
                    c.tone === "growth" && "bg-gradient-growth text-growth-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  ~{c.rate}/yr
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">{c.title}</p>
              <p className="mt-1 text-2xl font-bold text-foreground tracking-tight">
                {formatINR(c.value)}
              </p>
              <p className="text-xs text-primary font-medium mt-1">
                +{formatINR(c.value - amount)} earned
              </p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    c.tone === "growth" ? "bg-gradient-growth" : "bg-primary/70",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{c.tag}</p>
            </div>
          );
        })}
      </div>

      {/* Mutual fund picks */}
      <div className="mt-8 pt-6 border-t border-border/60">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h4 className="text-base md:text-lg font-bold text-foreground">
            Popular mutual funds to explore
          </h4>
          <span className="text-xs text-muted-foreground">
            Reputed Indian AMCs · invest via Groww
          </span>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          {FUND_PICKS.map((f) => (
            <a
              key={f.name}
              href={f.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-accent text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  {f.category}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="mt-3 text-sm font-bold text-foreground leading-snug">
                {f.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {f.note}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Invest on Groww →
              </span>
            </a>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Returns are illustrative. Mutual funds are subject to market risks — past performance doesn't guarantee future results. Fund links are for reference only and are not financial advice or affiliate recommendations.
      </p>
    </section>
  );
};
