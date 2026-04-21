import { motion } from "framer-motion";
import { formatCurrencyFull, type SavingsSummary as SavingsType } from "@/lib/loan-calculations";

interface SavingsSummaryProps {
  savings: SavingsType;
  symbol: string;
}

export function SavingsSummary({ savings, symbol }: SavingsSummaryProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Here's what your current strategy saves you
      </p>
      <div className="grid grid-cols-2 gap-4">
        {/* Interest Saved */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <p className="text-sm font-medium text-green-700 uppercase tracking-wide">
            Interest Saved
          </p>
          <p className="text-3xl font-bold text-green-700 mt-2 leading-tight">
            {formatCurrencyFull(savings.interestSaved, symbol)}
          </p>
        </motion.div>

        {/* Time Saved */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.075 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">
            Time Saved
          </p>
          <p className="text-3xl font-bold text-blue-700 mt-2 leading-tight">
            {savings.yearsSaved} yrs
          </p>
        </motion.div>
      </div>
    </div>
  );
}
