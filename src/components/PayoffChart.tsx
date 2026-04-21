import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from "recharts";
import type { StrategyResult } from "@/lib/loan-calculations";

interface PayoffChartProps {
  original: StrategyResult;
  optimized: StrategyResult | null;
  symbol: string;
}

function formatCompact(value: number, symbol: string): string {
  if (value >= 10000000) return `${symbol}${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${symbol}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

export function PayoffChart({ original, optimized, symbol }: PayoffChartProps) {
  const maxMonths = original.months;
  const data: { year: number; original: number; optimized?: number }[] = [];

  for (let y = 0; y <= Math.ceil(maxMonths / 12); y++) {
    const mIdx = y * 12 - 1;
    const origBalance = mIdx < 0
      ? original.schedule[0]?.balance + original.schedule[0]?.principal || 0
      : mIdx < original.schedule.length
        ? original.schedule[mIdx].balance
        : 0;

    let optBalance: number | undefined;
    if (optimized) {
      optBalance = mIdx < 0
        ? optimized.schedule[0]?.balance + optimized.schedule[0]?.principal || 0
        : mIdx < optimized.schedule.length
          ? optimized.schedule[mIdx].balance
          : 0;
    }

    data.push({ year: y, original: origBalance, optimized: optBalance });
  }

  const debtFreeYear = optimized
    ? Math.ceil(optimized.months / 12)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4"
    >
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Your road to ₹0 🏁</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {optimized
            ? "Look at that gap — that's money you're keeping. The green line is your smarter path."
            : "This is how your balance drops over time. Enable strategies to see a faster path!"}
        </p>
      </div>
      <div className="h-[240px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="year"
              tickFormatter={(v) => `Y${v}`}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => formatCompact(v, symbol)}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              }}
              formatter={(value: number, name: string) => [
                formatCompact(value, symbol),
                name === "original" ? "Without strategy" : "With your strategy ✨",
              ]}
              labelFormatter={(l) => `Year ${l}`}
            />
            <Legend
              formatter={(v) => (v === "original" ? "Without strategy" : "With your strategy ✨")}
              wrapperStyle={{ fontSize: "10px" }}
              iconSize={10}
            />
            <Line
              type="monotone"
              dataKey="original"
              stroke="hsl(var(--interest))"
              strokeWidth={2.5}
              dot={false}
            />
            {optimized && (
              <>
                <Line
                  type="monotone"
                  dataKey="optimized"
                  stroke="hsl(var(--principal))"
                  strokeWidth={2.5}
                  dot={false}
                  strokeDasharray="0"
                />
                {debtFreeYear !== null && (
                  <ReferenceDot
                    x={debtFreeYear}
                    y={0}
                    r={6}
                    fill="hsl(var(--principal))"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                )}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
