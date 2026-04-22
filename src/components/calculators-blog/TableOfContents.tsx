import { List } from "lucide-react";

const SECTIONS = [
  { id: "what-is-fd", label: "What is a Fixed Deposit?" },
  { id: "how-calculated", label: "How FD interest is calculated" },
  { id: "fd-vs-mf-sip", label: "FD vs Mutual Funds vs SIP" },
  { id: "tips", label: "Tips & strategies" },
  { id: "faqs", label: "Frequently asked questions" },
];

export const TableOfContents = () => (
  <aside className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <List className="h-3.5 w-3.5" />
      In this article
    </div>
    <ol className="mt-3 space-y-2">
      {SECTIONS.map((s, i) => (
        <li key={s.id} className="flex items-baseline gap-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground w-5">
            {String(i + 1).padStart(2, "0")}
          </span>
          <a
            href={`#${s.id}`}
            className="text-foreground hover:text-primary transition-colors"
          >
            {s.label}
          </a>
        </li>
      ))}
    </ol>
  </aside>
);
