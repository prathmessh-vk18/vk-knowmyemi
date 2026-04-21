export interface LoanInput {
  principal: number;
  annualRate: number;
  tenureYears: number;
}

export interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface YearlyBreakdown {
  year: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface StrategyConfig {
  stepUpPercent: number;
  stepUpEnabled: boolean;
  annualLumpSum: number;
  annualLumpSumEnabled: boolean;
  extraEmiEnabled: boolean;
  oneTimeMonth: number;
  oneTimeAmount: number;
  oneTimeEnabled: boolean;
  roundUpAmount: number;
  roundUpEnabled: boolean;
  refinanceRate: number;
  refinanceMonth: number;
  refinanceEnabled: boolean;
}

export interface StrategyResult {
  schedule: AmortizationEntry[];
  totalInterest: number;
  totalPaid: number;
  months: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export interface SavingsSummary {
  monthsSaved: number;
  yearsSaved: number;
  interestSaved: number;
}

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
] as const;

export const LOAN_TYPES = [
  "Home Loan",
  "Car Loan",
  "Personal Loan",
  "Other",
] as const;

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + r, tenureMonths);
  return (principal * r * factor) / (factor - 1);
}

export function generateAmortization(input: LoanInput): StrategyResult {
  const n = input.tenureYears * 12;
  const emi = calculateEMI(input.principal, input.annualRate, n);
  const r = input.annualRate / 12 / 100;
  const schedule: AmortizationEntry[] = [];
  let balance = input.principal;

  for (let m = 1; m <= n && balance > 0.01; m++) {
    const interestPart = balance * r;
    const principalPart = Math.min(emi - interestPart, balance);
    balance -= principalPart;
    schedule.push({
      month: m,
      emi,
      principal: principalPart,
      interest: interestPart,
      balance: Math.max(0, balance),
    });
  }

  const totalInterest = schedule.reduce((s, e) => s + e.interest, 0);
  const totalPaid = schedule.reduce((s, e) => s + e.principal + e.interest, 0);

  return {
    schedule,
    totalInterest,
    totalPaid,
    months: schedule.length,
    yearlyBreakdown: toYearlyBreakdown(schedule),
  };
}

export function generateStrategyAmortization(
  input: LoanInput,
  strategy: StrategyConfig
): StrategyResult {
  const n = input.tenureYears * 12;
  const baseEmi = calculateEMI(input.principal, input.annualRate, n);
  let r = input.annualRate / 12 / 100;
  const schedule: AmortizationEntry[] = [];
  let balance = input.principal;
  let currentEmi = baseEmi;

  for (let m = 1; balance > 0.01; m++) {
    // Step-up: increase EMI annually
    if (strategy.stepUpEnabled && strategy.stepUpPercent > 0 && m > 1 && (m - 1) % 12 === 0) {
      currentEmi *= 1 + strategy.stepUpPercent / 100;
    }



    // Refinance: recalculate EMI at a new rate from a specific month
    if (strategy.refinanceEnabled && strategy.refinanceRate > 0 && m === strategy.refinanceMonth) {
      const remainingMonths = Math.max(n - m + 1, 1);
      const newR = strategy.refinanceRate / 12 / 100;
      if (newR > 0) {
        const factor = Math.pow(1 + newR, remainingMonths);
        currentEmi = (balance * newR * factor) / (factor - 1);
      } else {
        currentEmi = balance / remainingMonths;
      }
      r = newR;
    }

    const interestPart = balance * r;
    let payment = currentEmi;

    // Round-up
    if (strategy.roundUpEnabled && strategy.roundUpAmount > 0) {
      payment += strategy.roundUpAmount;
    }

    let extraPayment = 0;

    // Annual lump sum (every 12th month)
    if (strategy.annualLumpSumEnabled && strategy.annualLumpSum > 0 && m % 12 === 0) {
      extraPayment += strategy.annualLumpSum;
    }

    // Extra EMI per year (every 12th month)
    if (strategy.extraEmiEnabled && m % 12 === 0) {
      extraPayment += baseEmi;
    }

    // One-time prepayment
    if (strategy.oneTimeEnabled && strategy.oneTimeAmount > 0 && m === strategy.oneTimeMonth) {
      extraPayment += strategy.oneTimeAmount;
    }

    const totalPayment = Math.min(payment + extraPayment, balance + interestPart);
    const principalPart = Math.min(totalPayment - interestPart, balance);
    balance -= principalPart;

    schedule.push({
      month: m,
      emi: totalPayment,
      principal: principalPart,
      interest: interestPart,
      balance: Math.max(0, balance),
    });

    if (balance <= 0.01) break;
    if (m > n * 2) break; // safety
  }

  const totalInterest = schedule.reduce((s, e) => s + e.interest, 0);
  const totalPaid = schedule.reduce((s, e) => s + e.principal + e.interest, 0);

  return {
    schedule,
    totalInterest,
    totalPaid,
    months: schedule.length,
    yearlyBreakdown: toYearlyBreakdown(schedule),
  };
}

function toYearlyBreakdown(schedule: AmortizationEntry[]): YearlyBreakdown[] {
  const years: YearlyBreakdown[] = [];
  for (let i = 0; i < schedule.length; i += 12) {
    const yearEntries = schedule.slice(i, i + 12);
    const principalPaid = yearEntries.reduce((s, e) => s + e.principal, 0);
    const interestPaid = yearEntries.reduce((s, e) => s + e.interest, 0);
    const closingBalance = yearEntries[yearEntries.length - 1].balance;
    years.push({
      year: Math.floor(i / 12) + 1,
      principalPaid,
      interestPaid,
      closingBalance,
    });
  }
  return years;
}

export function calculateSavings(original: StrategyResult, optimized: StrategyResult): SavingsSummary {
  return {
    monthsSaved: original.months - optimized.months,
    yearsSaved: Math.round((original.months - optimized.months) / 12 * 10) / 10,
    interestSaved: original.totalInterest - optimized.totalInterest,
  };
}

export function formatCurrency(amount: number, symbol: string): string {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${symbol}${(amount / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${symbol}${(amount / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatCurrencyFull(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function hasActiveStrategy(strategy: StrategyConfig): boolean {
  return (
    (strategy.stepUpEnabled && strategy.stepUpPercent > 0) ||
    (strategy.annualLumpSumEnabled && strategy.annualLumpSum > 0) ||
    strategy.extraEmiEnabled ||
    (strategy.oneTimeEnabled && strategy.oneTimeAmount > 0) ||
    (strategy.roundUpEnabled && strategy.roundUpAmount > 0) ||
    (strategy.refinanceEnabled && strategy.refinanceRate > 0)
  );
}
