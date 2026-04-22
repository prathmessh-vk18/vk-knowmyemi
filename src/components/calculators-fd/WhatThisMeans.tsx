import { useState } from "react";
import { Plane, Bike, Home, Smartphone, Car, ExternalLink, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  finalAmount: number;
}

type City = "mumbai" | "bangalore" | "delhi";

const CITY_RENT: Record<City, { label: string; monthly: number }> = {
  mumbai: { label: "Mumbai", monthly: 55000 },
  bangalore: { label: "Bangalore", monthly: 42000 },
  delhi: { label: "Delhi", monthly: 38000 },
};

type Item = {
  key: string;
  cost: number;
  icon: typeof Plane;
  title: (n: number) => string;
  subtitle: string;
  cta: string;
  href: string;
};

const buildItems = (city: City): Item[] => {
  const rent = CITY_RENT[city];
  return [
    {
      key: "iphone",
      cost: 134900,
      icon: Smartphone,
      title: (n) => `${n} × iPhone 16 Pro`,
      subtitle: "Apple's latest flagship (256GB)",
      cta: "Buy on Amazon",
      href: "https://www.amazon.in/s?k=iphone+16+pro+256gb",
    },
    {
      key: "s24",
      cost: 89999,
      icon: Smartphone,
      title: (n) => `${n} × Galaxy S24 Ultra`,
      subtitle: "Samsung flagship (256GB)",
      cta: "Buy on Amazon",
      href: "https://www.amazon.in/s?k=samsung+galaxy+s24+ultra",
    },
    {
      key: "bike",
      cost: 215000,
      icon: Bike,
      title: (n) => `${n} × Royal Enfield Classic 350`,
      subtitle: "On-road, ex-showroom approx.",
      cta: "View on Amazon",
      href: "https://www.amazon.in/s?k=royal+enfield+classic+350+accessories",
    },
    {
      key: "ktm",
      cost: 245000,
      icon: Bike,
      title: (n) => `${n} × KTM Duke 390`,
      subtitle: "Performance street bike",
      cta: "View on Amazon",
      href: "https://www.amazon.in/s?k=ktm+duke+390+accessories",
    },
    {
      key: "trip-bali",
      cost: 95000,
      icon: Plane,
      title: (n) => `${n} × Bali trip for two`,
      subtitle: "7 nights, flights + stay",
      cta: "Plan on MakeMyTrip",
      href: "https://www.makemytrip.com/holidays-india/bali-tour-packages.html",
    },
    {
      key: "trip-europe",
      cost: 280000,
      icon: Plane,
      title: (n) => `${n} × Europe trip for two`,
      subtitle: "10 nights across 3 cities",
      cta: "Plan on MakeMyTrip",
      href: "https://www.makemytrip.com/holidays-india/europe-tour-packages.html",
    },
    {
      key: "car",
      cost: 1100000,
      icon: Car,
      title: (n) => `${n} × Maruti Swift`,
      subtitle: "On-road, top variant approx.",
      cta: "Explore on Amazon",
      href: "https://www.amazon.in/s?k=car+accessories+swift",
    },
    {
      key: "rent",
      cost: rent.monthly,
      icon: Home,
      title: (n) => `${n} months in ${rent.label}`,
      subtitle: `Comfortable 1BHK lifestyle (~${formatShort(rent.monthly)}/mo)`,
      cta: "See rentals",
      href: `https://www.magicbricks.com/property-for-rent/residential-real-estate?cityName=${rent.label}`,
    },
  ];
};

function formatShort(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
}

export const WhatThisMeans = ({ finalAmount }: Props) => {
  const [city, setCity] = useState<City>("mumbai");

  const items = buildItems(city)
    .map((r) => ({ ...r, count: Math.floor(finalAmount / r.cost) }))
    .filter((r) => r.count >= 1)
    .sort((a, b) => b.count * b.cost - a.count * a.cost)
    .slice(0, 6);

  if (items.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-[#F8FAFC] border border-slate-100 p-5">
        <h3 className="text-lg font-bold text-foreground">What this could buy</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Increase your investment or time period to unlock real-life milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-[#F8FAFC] border border-slate-100 p-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">What this could buy</h3>
          <p className="text-sm text-slate-500 mt-1">
            Real products, real prices — putting your maturity amount in perspective.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 p-1">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground ml-2" />
          {(Object.keys(CITY_RENT) as City[]).map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                city === c
                  ? "bg-white text-slate-800 shadow-sm font-bold"
                  : "text-slate-400 font-semibold hover:text-slate-700",
              )}
            >
              {CITY_RENT[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.a
              key={it.key}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl bg-white border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {formatShort(it.cost)} ea
                </span>
              </div>
              <p className="mt-3 text-base font-bold text-slate-900 leading-snug">
                {it.title(it.count)}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-snug flex-1">
                {it.subtitle}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-1.5 transition-all">
                {it.cta} <ExternalLink className="h-3 w-3" />
              </span>
            </motion.a>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Prices are indicative and may vary. Links are for reference only and are not affiliate or financial advice.
      </p>
    </div>
  );
};
