import { ChevronRight } from "lucide-react";

export const Breadcrumbs = () => (
  <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
    <ol className="flex items-center gap-1.5 flex-wrap">
      <li>
        <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
      </li>
      <ChevronRight className="h-3 w-3" />
      <li className="text-slate-900 font-medium" aria-current="page">
        Fixed Deposit Calculators
      </li>
    </ol>
  </nav>
);
