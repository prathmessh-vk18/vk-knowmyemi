import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { type YearlyBreakdown } from "@/lib/loan-calculations";

interface AmortizationChartProps {
  data: YearlyBreakdown[];
  symbol: string;
}

function formatCompact(value: number, symbol: string): string {
  if (value >= 10000000) return `${symbol}${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${symbol}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

export function AmortizationChart({ data, symbol }: AmortizationChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4"
    >
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Year by year breakdown</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          See that? Interest eats up your early years. The good news — it shrinks over time 📉
        </p>
      </div>
      <div className="h-[240px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="15%" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
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
                name === "principalPaid" ? "Principal" : "Interest",
              ]}
              labelFormatter={(l) => `Year ${l}`}
            />
            <Legend
              formatter={(v) => (v === "principalPaid" ? "Principal" : "Interest")}
              wrapperStyle={{ fontSize: "10px" }}
              iconSize={10}
            />
            <Bar
              dataKey="principalPaid"
              stackId="a"
              fill="hsl(var(--principal))"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="interestPaid"
              stackId="a"
              fill="hsl(var(--interest))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
