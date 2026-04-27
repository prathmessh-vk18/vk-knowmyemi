import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const trustChips = [
  "Works for home, car & personal loans",
  "Takes under a minute",
  "100% private — runs in your browser",
  "Free, no signup needed",
];

interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section
      className="w-full"
      style={{
        paddingTop: "80px",
        paddingBottom: "64px",
        background: "linear-gradient(180deg, #dbeafe 0%, #e0f2fe 35%, #f0f9ff 65%, #ffffff 100%)",
        backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuB7mrYZvu6kR4BIPLbZvFYXY0JyW6HPKzJfniu9RD51ku62qlXfSRv-7c90zH-dUryN4J400t4nrH3Nb63TG7wTL1nSf54oUwdDMFUAXRDoeEZqMvhneiRRWlvMeR0PZ1l0dq0DXlTqJ9AmY8xvAOi0MSZzpHv1mVAsmqHonvsMzQr_U9gO0YTHCVGQ_Z0IAtcBnA1i1EImoqJOxyu7ZFLqWTui6B2raiIuSOPEFBEqUf9imhdgJ4Y65c_RO7aw1a_5h00lI6FaZhs)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-[55%_45%] gap-16 items-center">

          {/* Left — headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.0, 0, 0.2, 1] }}
            className="space-y-6"
          >
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Free Loan Calculator
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Taking a loan? Know exactly what you're getting into.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Debt Savvy Shine shows you your monthly payment, total interest cost, and
              — most importantly — how to pay it off faster and save money. No
              jargon, no signup, just clarity.
            </p>
            <div>
              <button
                onClick={onCTAClick}
                className="bg-primary hover:bg-blue-700 text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-base transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Calculate my loan
              </button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none p-0 m-0">
              {trustChips.map((text) => (
                <li key={text} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — floating mock result card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.0, 0, 0.2, 1], delay: 0.15 }}
            className="hidden lg:flex justify-center relative py-4"
          >
            {/* Shadow card behind */}
            <div
              className="absolute bg-card border border-border rounded-2xl"
              style={{
                width: 340,
                top: 16,
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%) rotate(-2deg)",
                opacity: 0.55,
              }}
            />

            {/* Main card */}
            <div
              className="relative bg-card rounded-2xl border border-border shadow-xl p-7"
              style={{ width: 340, transform: "rotate(1deg)" }}
            >
              {/* Free badge */}
              <div className="absolute -top-3 right-5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-200">
                Free · No signup
              </div>

              <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase mb-4">
                Home Loan · ₹25,00,000 · 8.5% · 20 yrs
              </p>

              <div className="mb-5">
                <p className="text-xs text-muted-foreground mb-1">Your monthly payment</p>
                <p className="text-4xl font-extrabold text-foreground tracking-tight">₹21,696</p>
              </div>

              <div className="border-t border-border pt-4 mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Total interest</p>
                  <p className="text-base font-bold text-interest">₹27,06,939</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Save with strategy</p>
                  <p className="text-base font-bold text-emerald-600">₹9,75,856</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-blue-600">Principal 48%</span>
                  <span className="text-[11px] font-semibold text-blue-400">Interest 52%</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary rounded-full" style={{ width: "48%" }} />
                </div>
              </div>

              <button
                onClick={onCTAClick}
                className="w-full bg-primary hover:bg-blue-700 text-primary-foreground font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Save ₹9.7L with smart repayment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
