import { motion } from "framer-motion";
import { formatINR } from "@/lib/finance";

interface Props {
  data: { year: number; value: number }[];
  invested: number;
}

export const MilestoneTimeline = ({ data, invested }: Props) => {
  const milestones = data.filter((d) => d.year > 0);
  return (
    <div className="w-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
        Year by Year Journey
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {milestones.map((m, i) => {
          const gain = m.value - invested;
          return (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Year {m.year}
              </span>
              <p className="mt-1.5 text-base font-bold text-slate-900 leading-none">
                {formatINR(m.value, { compact: true })}
              </p>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                +{formatINR(gain, { compact: true })}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
