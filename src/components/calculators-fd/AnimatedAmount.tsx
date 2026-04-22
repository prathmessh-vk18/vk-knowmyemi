import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { formatINR } from "@/lib/finance";

export const AnimatedAmount = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const display = useAnimatedNumber(value);
  return <span className={className}>{formatINR(display)}</span>;
};
