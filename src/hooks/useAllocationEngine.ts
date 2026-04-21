import { useMemo } from "react";

export interface FinancialInputs {
  // Loan details
  loanAmount: number;
  interestRate: number;
  remainingTenure: number;
  emiOverride: number | null;

  // Financial details
  income: number;
  expensePercent: number;
  emergencyFund: string;
  currentInvestments: number;
  hasBigExpense: boolean;
  bigExpenseAmount: number;
  bigExpenseTimeline: number;
  riskAppetite: string;
  salaryGrowth: string;
  lifePriority: number; // 0=loan focused, 100=lifestyle focused
}

export interface AllocationResult {
  // Loan analysis
  emi: number;
  totalInterest: number;
  totalPayable: number;
  emiToIncomeRatio: number;

  freeCash: number;
  isNegative: boolean;
  expenses: number;

  // Big expense
  bigExpenseMonthly: number;
  bigExpenseCapped: boolean;
  bigExpenseCapMessage: string;

  remainingCash: number;
  safetyLevel: "LOW" | "MEDIUM" | "HIGH";
  cashFlowLevel: "TIGHT" | "MODERATE" | "STRONG";
  financialMode: "Weak" | "Moderate" | "Strong";

  allocations: {
    loan: number;
    investment: number;
    bigExpense: number;
    lifestyle: number;
  };
  allocPercents: {
    loan: number;
    investment: number;
    bigExpense: number;
    lifestyle: number;
  };

  strategy: {
    extraEmi: number;
    lumpSumReserve: number;
  };

  // Simulation
  simulation: {
    withoutStrategy: { tenure: number; totalInterest: number; totalPayable: number };
    withStrategy: { tenure: number; totalInterest: number; totalPayable: number };
    interestSaved: number;
    tenureReduced: number;
  };

  trustLevel: "safe" | "warning" | "danger";
  trustMessage: string;
  explanation: string;
  tradeOffMessage: string;
}

export const defaultInputs: FinancialInputs = {
  loanAmount: 2000000,
  interestRate: 8.5,
  remainingTenure: 20,
  emiOverride: null,
  income: 80000,
  expensePercent: 45,
  emergencyFund: "3-6",
  currentInvestments: 10000,
  hasBigExpense: false,
  bigExpenseAmount: 200000,
  bigExpenseTimeline: 12,
  riskAppetite: "Balanced",
  salaryGrowth: "Medium (5-10%)",
  lifePriority: 50,
};

function calcEMI(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return Math.round(principal / n);
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function simulateLoan(principal: number, annualRate: number, monthlyPayment: number, extraMonthly: number) {
  const r = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 360;
  while (balance > 0 && months < maxMonths) {
    const interest = balance * r;
    totalInterest += interest;
    const principalPaid = monthlyPayment + extraMonthly - interest;
    if (principalPaid <= 0) {
      return { tenure: maxMonths / 12, totalInterest: totalInterest + balance * r * (maxMonths - months), totalPayable: principal + totalInterest };
    }
    balance = Math.max(0, balance - principalPaid);
    months++;
  }
  return {
    tenure: Math.round(months / 12 * 10) / 10,
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(principal + totalInterest),
  };
}

export function useAllocationEngine(inputs: FinancialInputs): AllocationResult {
  return useMemo(() => {
    // Step 1: Loan analysis
    const emi = inputs.emiOverride ?? calcEMI(inputs.loanAmount, inputs.interestRate, inputs.remainingTenure);
    const totalPayableOriginal = emi * inputs.remainingTenure * 12;
    const totalInterest = totalPayableOriginal - inputs.loanAmount;
    const emiToIncomeRatio = Math.round((emi / inputs.income) * 100);

    // Step 2: Free cash
    const expenses = Math.round(inputs.income * (inputs.expensePercent / 100));
    const freeCash = inputs.income - expenses - inputs.currentInvestments - emi;
    const isNegative = freeCash <= 0;

    // Safety level
    let safetyLevel: AllocationResult["safetyLevel"] = "LOW";
    if (inputs.emergencyFund === "3-6") safetyLevel = "MEDIUM";
    else if (inputs.emergencyFund === "6+") safetyLevel = "HIGH";

    // Cash flow level
    let cashFlowLevel: AllocationResult["cashFlowLevel"] = "TIGHT";
    if (inputs.expensePercent < 30) cashFlowLevel = "STRONG";
    else if (inputs.expensePercent <= 60) cashFlowLevel = "MODERATE";

    // Financial mode
    let financialMode: AllocationResult["financialMode"] = "Weak";
    if (safetyLevel === "HIGH" && cashFlowLevel !== "TIGHT" && emiToIncomeRatio < 40) financialMode = "Strong";
    else if (safetyLevel !== "LOW" && cashFlowLevel !== "TIGHT") financialMode = "Moderate";

    if (isNegative) {
      const sim = simulateLoan(inputs.loanAmount, inputs.interestRate, emi, 0);
      return {
        emi, totalInterest, totalPayable: totalPayableOriginal, emiToIncomeRatio,
        freeCash, isNegative, expenses,
        bigExpenseMonthly: 0, bigExpenseCapped: false, bigExpenseCapMessage: "",
        remainingCash: 0,
        safetyLevel, cashFlowLevel, financialMode,
        allocations: { loan: 0, investment: 0, bigExpense: 0, lifestyle: 0 },
        allocPercents: { loan: 0, investment: 0, bigExpense: 0, lifestyle: 0 },
        strategy: { extraEmi: 0, lumpSumReserve: 0 },
        simulation: {
          withoutStrategy: sim,
          withStrategy: sim,
          interestSaved: 0, tenureReduced: 0,
        },
        trustLevel: "danger",
        trustMessage: "Your current financial structure is not sustainable. Reduce expenses or EMI first.",
        explanation: "Your expenses, investments and EMI exceed your income.",
        tradeOffMessage: "",
      };
    }

    // Step 3: Big expense
    let bigExpenseMonthly = 0;
    let bigExpenseCapped = false;
    let bigExpenseCapMessage = "";
    if (inputs.hasBigExpense) {
      const raw = Math.round(inputs.bigExpenseAmount / inputs.bigExpenseTimeline);
      const cap = Math.round(freeCash * 0.4);
      if (raw > cap) {
        bigExpenseMonthly = cap;
        bigExpenseCapped = true;
        const achievable = cap * inputs.bigExpenseTimeline;
        const shortfall = inputs.bigExpenseAmount - achievable;
        bigExpenseCapMessage = `Capped at 40% of free cash (₹${cap.toLocaleString("en-IN")}/mo). You can accumulate ₹${achievable.toLocaleString("en-IN")} in ${inputs.bigExpenseTimeline} months — ₹${shortfall.toLocaleString("en-IN")} short of your ₹${inputs.bigExpenseAmount.toLocaleString("en-IN")} target.`;
      } else {
        bigExpenseMonthly = raw;
      }
    }

    const remainingCash = freeCash - bigExpenseMonthly;

    // Step 5: Allocation
    let loanPct: number, investPct: number, lifestylePct: number;

    if (inputs.riskAppetite === "Conservative") {
      loanPct = 20; investPct = 40; lifestylePct = 40;
    } else if (inputs.riskAppetite === "Balanced") {
      loanPct = 30; investPct = 40; lifestylePct = 30;
    } else {
      loanPct = 50; investPct = 30; lifestylePct = 20;
    }

    // Adjust with life priority slider (0=loan, 100=lifestyle)
    const shift = (inputs.lifePriority - 50) / 50; // -1 to 1
    const maxShift = 15;
     loanPct = Math.max(5, loanPct - Math.round(shift * maxShift));
    lifestylePct = Math.max(5, lifestylePct + Math.round(shift * maxShift));

    // Safety adjustment
    if (safetyLevel === "LOW") {
      loanPct = Math.max(5, loanPct - 10);
    }

    // Normalize
    const total = loanPct + investPct + lifestylePct;
    const lP = Math.round((loanPct / total) * 100);
    const iP = Math.round((investPct / total) * 100);
    const liP = 100 - lP - iP;

    const loan = Math.round(remainingCash * lP / 100);
    const investment = Math.round(remainingCash * iP / 100);
    const lifestyle = remainingCash - loan - investment;

    // Step 6: Loan strategy
    const extraEmi = Math.round(loan * 0.7);
    const lumpSumReserve = loan - extraEmi;

    // Step 7: Simulation
    const withoutStrategy = simulateLoan(inputs.loanAmount, inputs.interestRate, emi, 0);
    const withStrategy = simulateLoan(inputs.loanAmount, inputs.interestRate, emi, extraEmi);
    const interestSaved = withoutStrategy.totalInterest - withStrategy.totalInterest;
    const tenureReduced = Math.round((withoutStrategy.tenure - withStrategy.tenure) * 10) / 10;

    // Trust
    let trustLevel: AllocationResult["trustLevel"] = "safe";
    let trustMessage = "This plan balances loan reduction with lifestyle stability.";
    if (safetyLevel === "LOW" && lP > 30) {
      trustLevel = "warning";
      trustMessage = "This plan may strain your monthly finances. Build emergency fund first.";
    }
    if (cashFlowLevel === "TIGHT" && lP > 25) {
      trustLevel = "warning";
      trustMessage = "Your cash flow is tight. Consider reducing expenses before aggressive repayment.";
    }

    const explanation = financialMode === "Strong"
      ? "You're in a strong position — aggressively tackling your loan while maintaining investments and lifestyle."
      : financialMode === "Moderate"
        ? "You're balancing loan repayment with investments and lifestyle without overcommitting your finances."
        : "We're keeping loan payments conservative until your emergency fund grows. Focus on building safety first.";

    const tradeOffMessage = loan > 0 && lifestyle > 0
      ? `+₹${Math.round(loan * 0.1).toLocaleString("en-IN")} to loan = −₹${Math.round(loan * 0.1).toLocaleString("en-IN")} lifestyle`
      : "";

    return {
      emi, totalInterest, totalPayable: totalPayableOriginal, emiToIncomeRatio,
      freeCash, isNegative, expenses,
      bigExpenseMonthly, bigExpenseCapped, bigExpenseCapMessage,
      remainingCash,
      safetyLevel, cashFlowLevel, financialMode,
      allocations: { loan, investment, bigExpense: bigExpenseMonthly, lifestyle },
      allocPercents: { loan: lP, investment: iP, bigExpense: 0, lifestyle: liP },
      strategy: { extraEmi, lumpSumReserve },
      simulation: { withoutStrategy, withStrategy, interestSaved, tenureReduced },
      trustLevel, trustMessage, explanation, tradeOffMessage,
    };
  }, [inputs]);
}
