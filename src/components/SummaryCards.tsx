import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { formatCurrencyFull, type StrategyResult } from "@/lib/loan-calculations";

interface SummaryCardsProps {
  emi: number;
  result: StrategyResult;
  symbol: string;
}

function formatTimeline(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years}y ${months}mo`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.4, ease: "easeOut" as const, delay },
  }),
  hover: {
    y: -2,
    transition: { type: "tween", duration: 0.2, ease: "easeOut" as const },
  },
};

export function SummaryCards({ emi, result, symbol }: SummaryCardsProps) {
  const interestPercent = ((result.totalInterest / result.totalPaid) * 100).toFixed(1);
  const isHighInterest = Number(interestPercent) > 40;

  const cards = [
    {
      label: "YOUR MONTHLY EMI",
      value: formatCurrencyFull(emi, symbol),
      context: "Goes out every month, automatically",
      valueClass: "text-slate-900",
      warning: false,
    },
    {
      label: "TOTAL YOU'LL PAY BACK",
      value: formatCurrencyFull(result.totalPaid, symbol),
      context: "Principal + all interest combined",
      valueClass: "text-slate-900",
      warning: false,
    },
    {
      label: "INTEREST COST",
      value: formatCurrencyFull(result.totalInterest, symbol),
      context: `${interestPercent}% of your total payment goes to interest`,
      valueClass: isHighInterest ? "text-amber-600" : "text-slate-900",
      warning: isHighInterest,
    },
    {
      label: "TIME TO BE DEBT-FREE",
      value: formatTimeline(result.months),
      context: "Mark this date in your calendar",
      valueClass: "text-slate-900",
      warning: false,
    },
  ];

  const delays = [0.5, 0.6, 0.7, 0.8];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          custom={delays[i]}
          className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer
                     shadow-sm hover:shadow-md transition-shadow duration-200
                     flex flex-col gap-2"
        >
          {/* Label */}
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {card.label}
          </p>

          {/* Value */}
          <div className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight flex items-center gap-1.5 min-h-[2rem] ${card.valueClass}`}>
            {card.warning && (
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            )}
            <span className="tabular-nums tracking-tight">{card.value}</span>
          </div>

          {/* Context */}
          <p className="text-sm text-slate-500 leading-snug">
            {card.context}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
