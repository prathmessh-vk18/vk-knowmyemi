import { useState, useCallback } from "react";
import { defaultInputs, FinancialInputs, useAllocationEngine } from "@/hooks/useAllocationEngine";
import { useProgressiveSteps } from "@/hooks/useProgressiveSteps";
import EngineInputs from "./EngineInputs";
import EngineResults from "./EngineResults";
import { motion, AnimatePresence } from "framer-motion";

export function SmartLoanEngine() {
  const [inputs, setInputs] = useState<FinancialInputs>(defaultInputs);
  const result = useAllocationEngine(inputs);
  const steps = useProgressiveSteps();

  const handleChange = useCallback((updates: Partial<FinancialInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="grid lg:grid-cols-12 gap-6 mt-6 items-start">
      {/* Input Panel (Left, 4 columns) */}
      <div className="lg:col-span-4 transition-all duration-700 ease-in-out">
        <div className="glass-card overflow-hidden bg-card/60 border border-border shadow-sm rounded-2xl">
          <EngineInputs inputs={inputs} onChange={handleChange} steps={steps} />
        </div>
      </div>

      {/* Results Panel (Right, 8 columns) */}
      <AnimatePresence mode="wait">
        <motion.div
          key="results"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "tween", duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="glass-card overflow-hidden h-full min-h-[600px] bg-card/60 border border-border shadow-sm rounded-2xl">
            <EngineResults result={result} completed={steps.completed} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
