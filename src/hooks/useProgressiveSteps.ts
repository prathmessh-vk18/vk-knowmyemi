import { useState, useCallback, useMemo } from "react";

export interface StepDef {
  id: string;
  title: string;
  hint: string;
}

export const STEPS: StepDef[] = [
  { id: "loanAmount", title: "How much do you owe?", hint: "Your outstanding loan balance" },
  { id: "interestRate", title: "What's your interest rate?", hint: "Annual rate from your lender" },
  { id: "tenure", title: "Years remaining on loan", hint: "How long until you finish" },
  { id: "emi", title: "Confirm your EMI", hint: "Auto-calculated — adjust if needed" },
  { id: "income", title: "Your monthly income", hint: "After-tax take-home" },
  { id: "expenses", title: "Monthly fixed expenses", hint: "Rent, bills, groceries" },
  { id: "investments", title: "Current monthly investments", hint: "SIPs, mutual funds, stocks" },
  { id: "emergency", title: "Emergency fund saved", hint: "Months of expenses covered" },
  { id: "bigExpense", title: "Any big expense coming?", hint: "Wedding, car, vacation" },
  { id: "risk", title: "Your risk appetite", hint: "How aggressive should we be?" },
  { id: "growth", title: "Salary growth expectation", hint: "Yearly raise outlook" },
  { id: "priority", title: "Loan vs Lifestyle balance", hint: "What matters more right now?" },
];

export function useProgressiveSteps() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const [reviewMode, setReviewMode] = useState(false);

  const completeStep = useCallback((id: string) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const idx = STEPS.findIndex((s) => s.id === id);
    if (idx >= 0 && idx < STEPS.length - 1) {
      setActiveStep(STEPS[idx + 1].id);
    } else if (idx === STEPS.length - 1) {
      setReviewMode(true);
    }
  }, []);

  const goToStep = useCallback((id: string) => {
    setActiveStep(id);
  }, []);

  const reset = useCallback(() => {
    setCompleted(new Set());
    setActiveStep(STEPS[0].id);
    setReviewMode(false);
  }, []);

  const progress = useMemo(() => Math.round((completed.size / STEPS.length) * 100), [completed]);

  const isUnlocked = useCallback(
    (id: string) => {
      const idx = STEPS.findIndex((s) => s.id === id);
      if (idx === 0) return true;
      // Unlocked if all prior steps are completed
      for (let i = 0; i < idx; i++) {
        if (!completed.has(STEPS[i].id)) return false;
      }
      return true;
    },
    [completed]
  );

  return {
    completed,
    activeStep,
    setActiveStep: goToStep,
    completeStep,
    progress,
    isUnlocked,
    reviewMode,
    setReviewMode,
    reset,
    allDone: completed.size === STEPS.length,
  };
}
