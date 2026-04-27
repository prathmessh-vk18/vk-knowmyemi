import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingDown, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center text-center p-6 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm hover:bg-muted/50 transition-all duration-300"
    >
      <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
};

interface EMIHeroSectionProps {
  onCalculateClick: () => void;
  onLearnClick?: () => void;
}

export function EMIHeroSection({ onCalculateClick }: EMIHeroSectionProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById("hero-section")?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const heroElement = document.getElementById("hero-section");
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove);
      return () => heroElement.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <section
      id="hero-section"
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1220 810"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          className="opacity-40"
        >
          <defs>
            <radialGradient id="mouseGlow" cx="0" cy="0" r="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <g>
            {[...Array(35)].map((_, i) => (
              <React.Fragment key={`row-${i}`}>
                {[...Array(23)].map((_, j) => (
                  <rect
                    key={`${i}-${j}`}
                    x={-20 + i * 36}
                    y={9 + j * 36}
                    width="35.6"
                    height="35.6"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                    fill="none"
                  />
                ))}
              </React.Fragment>
            ))}

            <circle
              cx={mousePosition.x}
              cy={mousePosition.y}
              r="150"
              fill="url(#mouseGlow)"
              className="pointer-events-none"
            />
          </g>
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-background/95 to-background z-[1]" />

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 py-20 md:py-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              No signup required • 100% Free
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight"
          >
            Taking a loan?{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Know exactly
            </span>
            <br />
            what you're getting into.
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed"
          >
            Debt Savvy Shine shows your monthly payment, total interest cost, and how to pay it off faster and save money.{" "}
            <span className="font-semibold text-foreground">No jargon, no signup, just clarity.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              size="lg"
              className="text-base px-8 h-12 group cursor-pointer"
              onClick={onCalculateClick}
            >
              Calculate Your EMI
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-12"
          >
            <FeatureCard
              icon={<Calculator className="h-6 w-6" />}
              title="Monthly Payment"
              description="See your exact EMI amount instantly with our accurate calculator"
            />
            <FeatureCard
              icon={<TrendingDown className="h-6 w-6" />}
              title="Total Interest"
              description="Understand the true cost of your loan over its entire duration"
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Pay Off Faster"
              description="Discover strategies to reduce your loan tenure and save money"
            />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm text-muted-foreground"
          >
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">100K+</div>
              <div>Calculations Done</div>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">₹500Cr+</div>
              <div>Loans Analyzed</div>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">Free</div>
              <div>Always & Forever</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
