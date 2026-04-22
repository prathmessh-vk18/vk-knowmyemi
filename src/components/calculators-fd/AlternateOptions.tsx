import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "MUTUAL FUND" | "ELSS" | "PPF" | "INDEX FUND" | "EQUITY FUND";

interface Fund {
  name: string;
  category: Category;
  note: string;
  href: string;
}

const FUNDS: Fund[] = [
  {
    name: "HDFC Top 100 Fund",
    category: "MUTUAL FUND",
    note: "Steady blue-chip exposure from a trusted AMC",
    href: "https://groww.in/mutual-funds/hdfc-top-100-fund-direct-plan-growth",
  },
  {
    name: "Parag Parikh Flexi Cap",
    category: "EQUITY FUND",
    note: "Diversified across India + global stocks",
    href: "https://groww.in/mutual-funds/parag-parikh-flexi-cap-fund-direct-growth",
  },
  {
    name: "HDFC ELSS Tax Saver",
    category: "ELSS",
    note: "Save tax u/s 80C with 3-year lock-in",
    href: "https://groww.in/mutual-funds/hdfc-taxsaver-growth",
  },
  {
    name: "Public Provident Fund",
    category: "PPF",
    note: "Government-backed 15-yr scheme, 7.1% p.a.",
    href: "https://www.india.gov.in/spotlight/public-provident-fund-scheme",
  },
  {
    name: "UTI Nifty 50 Index Fund",
    category: "INDEX FUND",
    note: "Low-cost passive Nifty 50 tracker",
    href: "https://groww.in/mutual-funds/uti-nifty-50-index-fund-direct-growth",
  },
  {
    name: "Mirae Asset ELSS Tax Saver",
    category: "ELSS",
    note: "Top-rated ELSS with consistent outperformance",
    href: "https://groww.in/mutual-funds/mirae-asset-tax-saver-fund-direct-growth",
  },
];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
  "MUTUAL FUND": { bg: "bg-blue-100", text: "text-blue-700" },
  "ELSS":        { bg: "bg-violet-100", text: "text-violet-700" },
  "PPF":         { bg: "bg-emerald-100", text: "text-emerald-700" },
  "INDEX FUND":  { bg: "bg-amber-100", text: "text-amber-700" },
  "EQUITY FUND": { bg: "bg-orange-100", text: "text-orange-700" },
};

export const AlternateOptions = () => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Alternate Options to Explore
          </p>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Invest via Groww, Zerodha, or directly
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FUNDS.map((fund) => {
          const style = CATEGORY_COLORS[fund.category];
          return (
            <a
              key={fund.name}
              href={fund.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    style.bg,
                    style.text,
                  )}
                >
                  {fund.category}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug">{fund.name}</p>
              <p className="text-xs text-slate-500 leading-snug">{fund.note}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                Explore on Groww →
              </span>
            </a>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-slate-400 font-medium">
        Returns are illustrative. Mutual funds are subject to market risks. Links are for reference only — not financial advice.
      </p>
    </div>
  );
};
