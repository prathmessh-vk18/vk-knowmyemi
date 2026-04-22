import { useState, useMemo } from 'react';

export interface FDInput {
  depositAmount: number;
  interestRate: number;
  tenureYears: number;
  compoundingFrequency: 1 | 2 | 4 | 12; // Yearly, Half-Yearly, Quarterly, Monthly
}

const DEFAULT_INPUT: FDInput = {
  depositAmount: 100000,
  interestRate: 7.0,
  tenureYears: 5,
  compoundingFrequency: 4, // Quarterly is standard for FD in India
};

export const useFDCalculator = () => {
  const [input, setInput] = useState<FDInput>(DEFAULT_INPUT);

  const calculateFD = (data: FDInput) => {
    const P = data.depositAmount;
    const r = data.interestRate / 100;
    const n = data.compoundingFrequency;
    const t = data.tenureYears;

    // A = P(1 + r/n)^(nt)
    const maturityAmount = P * Math.pow(1 + r / n, n * t);
    const wealthGained = maturityAmount - P;

    // Yearly Breakdown for Chart
    const yearlyBreakdown = [];
    let currentBalance = P;
    
    for (let year = 1; year <= t; year++) {
      const yearEndBalance = P * Math.pow(1 + r / n, n * year);
      const interestEarnedThatYear = yearEndBalance - currentBalance;
      
      yearlyBreakdown.push({
        year,
        balance: Math.round(yearEndBalance),
        interest: Math.round(interestEarnedThatYear),
        cumulativeInterest: Math.round(yearEndBalance - P)
      });
      currentBalance = yearEndBalance;
    }

    return {
      investedAmount: Math.round(P),
      wealthGained: Math.round(wealthGained),
      maturityAmount: Math.round(maturityAmount),
      yearlyBreakdown
    };
  };

  const results = useMemo(() => calculateFD(input), [input]);

  return {
    input,
    setInput,
    results
  };
};
