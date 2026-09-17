import React from 'react';
import { IndianRupee, Package, CalendarDays, TrendingUp } from 'lucide-react';
import { ProductExpense } from '../types';
import { formatRupees, getAutoDateTime } from '../utils/formatters';

interface ProductStatsProps {
  products: ProductExpense[];
}

export const ProductStats: React.FC<ProductStatsProps> = ({ products }) => {
  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);
  const totalCount = products.length;
  const avgPrice = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Calculate today's spend
  const todayStr = getAutoDateTime().date; // e.g. "17 Sep 2026"
  const todaySpend = products
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Total Spend in Rupees */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs hover:border-blue-400/50 transition-colors">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Total Spent
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-base xs:text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
            {formatRupees(totalAmount)}
          </p>
        </div>
        <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
          All logged products in INR
        </p>
      </div>

      {/* 2. Today's Spend */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs hover:border-emerald-400/50 transition-colors">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Today&apos;s Spend
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-base xs:text-lg sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight truncate">
            {formatRupees(todaySpend)}
          </p>
        </div>
        <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
          Logged for {todayStr}
        </p>
      </div>

      {/* 3. Total Products Logged */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs hover:border-amber-400/50 transition-colors">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Products Logged
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-base xs:text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
            {totalCount}
          </p>
        </div>
        <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
          Recorded line items
        </p>
      </div>

      {/* 4. Average Item Price */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs hover:border-indigo-400/50 transition-colors">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            Average Price
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-base xs:text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
            {formatRupees(avgPrice)}
          </p>
        </div>
        <p className="mt-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
          Per product entry
        </p>
      </div>
    </div>
  );
};
