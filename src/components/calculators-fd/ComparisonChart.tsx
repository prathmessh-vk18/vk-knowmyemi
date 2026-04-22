import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { compoundAnnual, fdMaturity, formatINR } from "@/lib/finance";

interface Props {
  amount: number;
  years: number;
  fdRate: number;
}

const MF_RATE = 12;
const SIP_RATE = 10;

function buildSeries(amount: number, fdRate: number, years: number) {
  const data: { year: number; fd: number; equity: number; debt: number; invested: number }[] = [];
  for (let y = 0; y <= years; y++) {
    data.push({
      year: y,
      fd: Math.round(fdMaturity(amount, fdRate, y)),
      equity: Math.round(compoundAnnual(amount, MF_RATE, y)),
      debt: Math.round(compoundAnnual(amount, SIP_RATE, y)),
      invested: amount,
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-[200px]">
      <p className="font-bold text-slate-700 mb-2">{label === 0 ? "Today" : `Year ${label}`}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-slate-800">{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const ComparisonChart = ({ amount, years, fdRate }: Props) => {
  const data = buildSeries(amount, fdRate, years);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
        <LegendItem color="#2563eb" dash={false} label={`Fixed Deposit (${fdRate}%)`} />
        <LegendItem color="#059669" dash={false} label={`Debt Mutual Fund (~${SIP_RATE}%)`} />
        <LegendItem color="#f59e0b" dash={false} label={`Equity Mutual Fund (~${MF_RATE}%)`} />
        <LegendItem color="#94a3b8" dash label="Invested" />
      </div>

      <div className="h-64 md:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <filter id="glow-blue">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="year"
              tickFormatter={(y) => (y === 0 ? "Now" : `Y${y}`)}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatINR(v, { compact: true })}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Invested principal — dashed grey */}
            <Line
              type="monotone"
              dataKey="invested"
              name="Invested"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            {/* FD — blue */}
            <Line
              type="monotone"
              dataKey="fd"
              name={`FD (${fdRate}%)`}
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#2563eb" }}
              isAnimationActive
              animationDuration={700}
            />
            {/* Debt MF — green */}
            <Line
              type="monotone"
              dataKey="debt"
              name={`Debt Fund (${SIP_RATE}%)`}
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#059669" }}
              isAnimationActive
              animationDuration={800}
            />
            {/* Equity MF — amber */}
            <Line
              type="monotone"
              dataKey="equity"
              name={`Equity Fund (${MF_RATE}%)`}
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#f59e0b" }}
              isAnimationActive
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[11px] text-slate-400 font-medium">
        Returns are illustrative. Mutual funds are subject to market risks. Past performance doesn't guarantee future results.
      </p>
    </div>
  );
};

const LegendItem = ({
  color,
  label,
  dash,
}: {
  color: string;
  label: string;
  dash: boolean;
}) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
    {dash ? (
      <svg width="20" height="4" viewBox="0 0 20 4">
        <line x1="0" y1="2" x2="20" y2="2" stroke={color} strokeWidth="2" strokeDasharray="4 3" />
      </svg>
    ) : (
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
    )}
    {label}
  </span>
);
