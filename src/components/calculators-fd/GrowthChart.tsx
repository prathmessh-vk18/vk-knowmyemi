import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/finance";

interface Props {
  data: { year: number; value: number; invested: number }[];
}

export const GrowthChart = ({ data }: Props) => {
  return (
    <div className="h-64 md:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="investedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="year"
            tickFormatter={(y) => (y === 0 ? "Now" : `Y${y}`)}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatINR(v, { compact: true })}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              boxShadow: "var(--shadow-card)",
              fontSize: 13,
            }}
            labelFormatter={(y) => (y === 0 ? "Today" : `Year ${y}`)}
            formatter={(val: number, name) => [
              formatINR(val),
              name === "value" ? "Your money" : "Invested",
            ]}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="url(#investedFill)"
            isAnimationActive
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#growthFill)"
            isAnimationActive
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
