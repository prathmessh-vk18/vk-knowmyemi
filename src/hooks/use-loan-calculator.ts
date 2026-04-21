import { useState, useMemo, useCallback } from "react";
import {
  LoanInput,
  StrategyConfig,
  generateAmortization,
  generateStrategyAmortization,
  calculateSavings,
  calculateEMI,
  hasActiveStrategy,
  CURRENCIES,
} from "@/lib/loan-calculations";

const DEFAULT_STRATEGY: StrategyConfig = {
  stepUpPercent: 5,
  stepUpEnabled: false,
  annualLumpSum: 50000,
  annualLumpSumEnabled: false,
  extraEmiEnabled: false,
  oneTimeMonth: 24,
  oneTimeAmount: 200000,
  oneTimeEnabled: false,
  roundUpAmount: 2000,
  roundUpEnabled: false,
  refinanceRate: 7.5,
  refinanceMonth: 24,
  refinanceEnabled: false,
};

export function useLoanCalculator() {
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>(CURRENCIES[0]);
  const [loanType, setLoanType] = useState<string>("Home Loan");
  const [input, setInput] = useState<LoanInput>({
    principal: 2500000,
    annualRate: 8.5,
    tenureYears: 20,
  });
  const [strategy, setStrategy] = useState<StrategyConfig>(DEFAULT_STRATEGY);

  const emi = useMemo(
    () => calculateEMI(input.principal, input.annualRate, input.tenureYears * 12),
    [input]
  );

  const original = useMemo(() => generateAmortization(input), [input]);

  const optimized = useMemo(() => {
    if (!hasActiveStrategy(strategy)) return null;
    return generateStrategyAmortization(input, strategy);
  }, [input, strategy]);

  const savings = useMemo(() => {
    if (!optimized) return null;
    return calculateSavings(original, optimized);
  }, [original, optimized]);

  const updateInput = useCallback((partial: Partial<LoanInput>) => {
    setInput((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateStrategy = useCallback((partial: Partial<StrategyConfig>) => {
    setStrategy((prev) => ({ ...prev, ...partial }));
  }, []);

  const isStrategyActive = hasActiveStrategy(strategy);

  return {
    currency,
    setCurrency,
    loanType,
    setLoanType,
    input,
    updateInput,
    strategy,
    updateStrategy,
    emi,
    original,
    optimized,
    savings,
    isStrategyActive,
  };
}
