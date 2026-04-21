import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface CompositionBarProps {
  principalPercent: number;
}

export function CompositionBar({ principalPercent }: CompositionBarProps) {
  const interestPercent = 100 - principalPercent;
  const isInterestHeavy = interestPercent > 55;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.4, ease: "easeOut", delay: 0.9 }}
      className="glass-card rounded-2xl p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Payment Composition</h3>
        {isInterestHeavy && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-xs text-interest font-medium"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>High Interest Ratio</span>
          </motion.div>
        )}
      </div>
      <div className="relative h-8 rounded-full overflow-hidden bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${principalPercent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-y-0 left-0 bg-principal rounded-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${interestPercent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
          className="absolute inset-y-0 right-0 bg-interest rounded-l-none rounded-full"
        />
      </div>
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-principal" />
          <span className="text-muted-foreground">
            Principal <span className="font-mono text-foreground">{principalPercent.toFixed(1)}%</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            Interest <span className="font-mono text-foreground">{interestPercent.toFixed(1)}%</span>
          </span>
          <div className="w-3 h-3 rounded-full bg-interest" />
        </div>
      </div>
    </motion.div>
  );
}
