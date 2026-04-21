import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, MousePointerClick } from "lucide-react";
import { formatCurrencyFull, type YearlyBreakdown, type AmortizationEntry } from "@/lib/loan-calculations";

interface AmortizationTableProps {
  yearlyBreakdown: YearlyBreakdown[];
  schedule: AmortizationEntry[];
  symbol: string;
  title?: string;
  variant?: "original" | "optimized";
}

export function AmortizationTable({
  yearlyBreakdown,
  schedule,
  symbol,
  title = "Amortization Schedule",
  variant = "original",
}: AmortizationTableProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const getMonthsForYear = (year: number) => {
    const startIdx = (year - 1) * 12;
    return schedule.slice(startIdx, startIdx + 12);
  };

  const accentClass = variant === "optimized" ? "text-principal" : "text-interest";
  const showEmi = variant === "optimized";

  // Compute yearly average EMI for optimized view
  const getYearlyEmiTotal = (year: number) => {
    const months = getMonthsForYear(year);
    return months.reduce((s, m) => s + m.emi, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 max-w-full overflow-hidden"
    >
      {title && (
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
            <MousePointerClick className="h-3 w-3 inline-block" />
            Click any year to see the monthly breakdown
          </p>
        </div>
      )}

      <div className="w-full -mx-3 sm:mx-0">
        <div className="overflow-x-auto px-3 sm:px-0">
          <div className="max-h-[400px] overflow-y-auto rounded-xl border border-border/50 inline-block min-w-full">
            <table className="w-full text-sm min-w-[480px]">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
            <tr>
              <th className="text-left px-2 sm:px-3 py-2 sm:py-3 font-semibold text-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">Year</th>
              {showEmi && (
                <th className="text-right px-2 sm:px-3 py-2 sm:py-3 font-semibold text-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">EMI</th>
              )}
              <th className="text-right px-2 sm:px-3 py-2 sm:py-3 font-semibold text-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">Principal</th>
              <th className="text-right px-2 sm:px-3 py-2 sm:py-3 font-semibold text-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">Interest</th>
              <th className="text-right px-2 sm:px-3 py-2 sm:py-3 font-semibold text-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">Balance</th>
            </tr>
          </thead>
          <tbody>
            {yearlyBreakdown.map((row) => {
              const isExpanded = expandedYear === row.year;
              const months = isExpanded ? getMonthsForYear(row.year) : [];

              return (
                <AnimatePresence key={row.year}>
                  <tr
                    className="border-b border-border/30 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setExpandedYear(isExpanded ? null : row.year)}
                  >
                    <td className="px-2 sm:px-3 py-2 sm:py-2.5 font-medium text-foreground flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${accentClass}`} />
                      ) : (
                        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-xs sm:text-sm">Y{row.year}</span>
                    </td>
                    {showEmi && (
                      <td className="text-right px-2 sm:px-3 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs text-accent-foreground whitespace-nowrap">
                        {symbol}{Math.round(getYearlyEmiTotal(row.year)).toLocaleString("en-IN")}
                      </td>
                    )}
                    <td className="text-right px-2 sm:px-3 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs text-principal whitespace-nowrap">
                      {symbol}{Math.round(row.principalPaid).toLocaleString("en-IN")}
                    </td>
                    <td className="text-right px-2 sm:px-3 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs text-interest whitespace-nowrap">
                      {symbol}{Math.round(row.interestPaid).toLocaleString("en-IN")}
                    </td>
                    <td className="text-right px-2 sm:px-3 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs text-foreground whitespace-nowrap">
                      {symbol}{Math.round(row.closingBalance).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  {isExpanded && months.map((m) => (
                    <motion.tr
                      key={`m-${m.month}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-muted/20 border-b border-border/20"
                    >
                      <td className="px-2 sm:px-3 py-1.5 pl-6 sm:pl-9 text-[10px] sm:text-xs text-muted-foreground">
                        M{m.month}
                      </td>
                      {showEmi && (
                        <td className="text-right px-2 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs text-accent-foreground/80 whitespace-nowrap">
                          {symbol}{Math.round(m.emi).toLocaleString("en-IN")}
                        </td>
                      )}
                      <td className="text-right px-2 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs text-principal/80 whitespace-nowrap">
                        {symbol}{Math.round(m.principal).toLocaleString("en-IN")}
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs text-interest/80 whitespace-nowrap">
                        {symbol}{Math.round(m.interest).toLocaleString("en-IN")}
                      </td>
                      <td className="text-right px-2 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                        {symbol}{Math.round(m.balance).toLocaleString("en-IN")}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
