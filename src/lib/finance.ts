export const formatINR = (value: number, opts?: { compact?: boolean }) => {
  if (!isFinite(value)) return "₹0";
  if (opts?.compact) {
    if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
    if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`;
    if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)} K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
};

export const fdMaturity = (principal: number, ratePct: number, years: number) => {
  const r = ratePct / 100;
  const n = 4;
  return principal * Math.pow(1 + r / n, n * years);
};

export const compoundAnnual = (principal: number, ratePct: number, years: number) =>
  principal * Math.pow(1 + ratePct / 100, years);

export const buildYearlySeries = (
  principal: number,
  ratePct: number,
  years: number,
) => {
  const data: { year: number; value: number; invested: number }[] = [];
  for (let y = 0; y <= years; y++) {
    data.push({
      year: y,
      value: Math.round(fdMaturity(principal, ratePct, y)),
      invested: principal,
    });
  }
  return data;
};

export const inflationAdjusted = (
  futureValue: number,
  inflationPct: number,
  years: number,
) => futureValue / Math.pow(1 + inflationPct / 100, years);

export const effectiveAnnualGrowth = (
  principal: number,
  finalValue: number,
  years: number,
) => {
  if (years <= 0 || principal <= 0) return 0;
  return (Math.pow(finalValue / principal, 1 / years) - 1) * 100;
};
