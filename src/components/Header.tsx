import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Calculator } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  return (
    <header className="absolute top-0 w-full z-50 bg-transparent">
      <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <img src="/icon.png" alt="Debt Savvy Shine Logo" className="h-[56px] w-auto drop-shadow-sm" />
            </motion.div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/financialcoach" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
            Financial Coach
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors outline-none cursor-pointer">
              Calculators <ChevronDown className="h-4 w-4 text-slate-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-xl rounded-xl p-1 mt-2">
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50 p-2.5 rounded-lg">
                <Link to="/calculators/fixed-deposit" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-slate-700 text-sm">FD Calculator</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};
