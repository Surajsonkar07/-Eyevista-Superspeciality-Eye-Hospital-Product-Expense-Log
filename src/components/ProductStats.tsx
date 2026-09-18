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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Spend in Rupees */}
      <div className="relative glass-panel p-4 sm:p-5 rounded-[18px] border border-stone-200/90 dark:border-[#202A3A] dark:hover:border-[#344158] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] transition-all duration-200 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-[#A7B2C4] tracking-tight block truncate">
              Total Spent
            </span>
            <div className="mt-1 sm:mt-1.5">
              <p className="text-xl sm:text-[28px] lg:text-[32px] font-bold font-mono text-slate-900 dark:text-[#F1F5F9] tabular-nums tracking-tight truncate leading-tight">
                {formatRupees(totalAmount)}
              </p>
            </div>
          </div>

          {/* Soft Restrained Icon Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-[#4F7CFF]/10 border border-blue-200/60 dark:border-[#4F7CFF]/25 text-blue-600 dark:text-[#4F7CFF] flex items-center justify-center shrink-0 icon-glow-blue transition-colors">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#202A3A] flex items-center justify-between text-[11px] sm:text-[12px] text-slate-500 dark:text-[#718096]">
          <span className="truncate">All logged products in INR</span>
        </div>
      </div>

      {/* 2. Today's Spend */}
      <div className="relative glass-panel p-4 sm:p-5 rounded-[18px] border border-stone-200/90 dark:border-[#202A3A] dark:hover:border-[#344158] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] transition-all duration-200 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-[#A7B2C4] tracking-tight block truncate">
              Today&apos;s Spend
            </span>
            <div className="mt-1 sm:mt-1.5">
              <p className="text-xl sm:text-[28px] lg:text-[32px] font-bold font-mono text-emerald-600 dark:text-[#22C997] tabular-nums tracking-tight truncate leading-tight">
                {formatRupees(todaySpend)}
              </p>
            </div>
          </div>

          {/* Soft Restrained Icon Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-[#22C997]/10 border border-emerald-200/60 dark:border-[#22C997]/25 text-emerald-600 dark:text-[#22C997] flex items-center justify-center shrink-0 icon-glow-green transition-colors">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#202A3A] flex items-center justify-between text-[11px] sm:text-[12px] text-slate-500 dark:text-[#718096]">
          <span className="truncate">Logged for {todayStr}</span>
        </div>
      </div>

      {/* 3. Total Products Logged */}
      <div className="relative glass-panel p-4 sm:p-5 rounded-[18px] border border-stone-200/90 dark:border-[#202A3A] dark:hover:border-[#344158] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] transition-all duration-200 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-[#A7B2C4] tracking-tight block truncate">
              Products Logged
            </span>
            <div className="mt-1 sm:mt-1.5">
              <p className="text-xl sm:text-[28px] lg:text-[32px] font-bold font-mono text-slate-900 dark:text-[#F1F5F9] tabular-nums tracking-tight truncate leading-tight">
                {totalCount}
              </p>
            </div>
          </div>

          {/* Soft Restrained Icon Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-[#F5B83D]/10 border border-amber-200/60 dark:border-[#F5B83D]/25 text-amber-600 dark:text-[#F5B83D] flex items-center justify-center shrink-0 icon-glow-amber transition-colors">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#202A3A] flex items-center justify-between text-[11px] sm:text-[12px] text-slate-500 dark:text-[#718096]">
          <span className="truncate">Recorded line items</span>
        </div>
      </div>

      {/* 4. Average Item Price */}
      <div className="relative glass-panel p-4 sm:p-5 rounded-[18px] border border-stone-200/90 dark:border-[#202A3A] dark:hover:border-[#344158] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] transition-all duration-200 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-[#A7B2C4] tracking-tight block truncate">
              Average Price
            </span>
            <div className="mt-1 sm:mt-1.5">
              <p className="text-xl sm:text-[28px] lg:text-[32px] font-bold font-mono text-slate-900 dark:text-[#F1F5F9] tabular-nums tracking-tight truncate leading-tight">
                {formatRupees(avgPrice)}
              </p>
            </div>
          </div>

          {/* Soft Restrained Icon Badge */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-[#6D7CFF]/10 border border-indigo-200/60 dark:border-[#6D7CFF]/25 text-indigo-600 dark:text-[#6D7CFF] flex items-center justify-center shrink-0 icon-glow-indigo transition-colors">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#202A3A] flex items-center justify-between text-[11px] sm:text-[12px] text-slate-500 dark:text-[#718096]">
          <span className="truncate">Per product entry</span>
        </div>
      </div>
    </div>
  );
};
