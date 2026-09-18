import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Package,
} from 'lucide-react';
import { Sheet } from '../types';
import { formatRupees } from '../utils/formatters';

interface ExpenseAnalyticsProps {
  sheet: Sheet;
  onSetBudget?: (limit: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Medical Supplies': '#3b82f6', // Blue
  Pharmacy: '#10b981', // Emerald
  Equipment: '#f59e0b', // Amber
  OPD: '#8b5cf6', // Purple
  OT: '#ec4899', // Pink
  General: '#64748b', // Slate
};

export const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({ sheet }) => {
  const products = sheet.products || [];
  const totalSpent = products.reduce((acc, p) => acc + p.price, 0);
  const budgetLimit = sheet.budgetLimit || 50000;
  const budgetPercentage = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  const isOverBudget = totalSpent > budgetLimit;
  const isNearBudget = totalSpent >= budgetLimit * 0.8 && !isOverBudget;

  // 1. Group by Category
  const categoryMap: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + p.price;
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
    color: CATEGORY_COLORS[cat] || '#6366f1',
  }));

  // 2. Top 5 Most Expensive Line Items
  const topExpenseItems = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5)
    .map((item) => ({
      name: item.productName.length > 18 ? item.productName.substring(0, 18) + '...' : item.productName,
      fullName: item.productName,
      price: item.price,
    }));

  const highestItem = products.length > 0 ? [...products].sort((a, b) => b.price - a.price)[0] : null;

  return (
    <div className="space-y-4">
      {/* 1. Header & Budget Progress Banner */}
      <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-[#111722] border border-stone-200/90 dark:border-[#202A3A] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-[#F1F5F9]">
                Expense Analytics &amp; Insights
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-[rgba(79,124,255,0.12)] text-blue-700 dark:text-[#638DFF] border border-blue-200 dark:border-[rgba(79,124,255,0.25)]">
                {sheet.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#718096] mt-0.5">
              Live breakdown of category allocations, top spend items, and budget utilization in Rupees (₹)
            </p>
          </div>

          {/* Budget Limit Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isOverBudget ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-rose-50 dark:bg-[rgba(241,91,108,0.12)] border border-rose-200 dark:border-[rgba(241,91,108,0.25)] text-rose-700 dark:text-[#F15B6C] text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-[#F15B6C]" />
                <span>Over Budget ({budgetPercentage}%)</span>
              </div>
            ) : isNearBudget ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-amber-50 dark:bg-[rgba(245,184,61,0.12)] border border-amber-200 dark:border-[rgba(245,184,61,0.25)] text-amber-700 dark:text-[#F5B83D] text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#F5B83D]" />
                <span>Near Limit ({budgetPercentage}%)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-emerald-50 dark:bg-[rgba(34,201,151,0.12)] border border-emerald-200 dark:border-[rgba(34,201,151,0.25)] text-emerald-700 dark:text-[#22C997] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#22C997]" />
                <span>Budget Healthy ({budgetPercentage}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500 dark:text-[#718096]">
              Budget Used: <strong className="font-mono text-slate-900 dark:text-[#F1F5F9]">{formatRupees(totalSpent)}</strong> of <span className="font-mono">{formatRupees(budgetLimit)}</span>
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-[#A7B2C4]">
              {budgetPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 dark:bg-[#151D2A] rounded-full overflow-hidden p-0.5 border border-stone-200/60 dark:border-[#202A3A]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-[#F15B6C]'
                  : isNearBudget
                  ? 'bg-[#F5B83D]'
                  : 'bg-[#22C997]'
              }`}
              style={{ width: `${Math.min(100, budgetPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown (Donut Chart) */}
        <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-[#111722] border border-stone-200/90 dark:border-[#202A3A] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#1A2A4A] text-blue-600 dark:text-[#4F7CFF] border border-transparent dark:border-[rgba(79,124,255,0.25)] flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-[#A7B2C4]">
              Expense Distribution by Category
            </h4>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-[#718096]">
              No expenses logged yet in this sheet to visualize.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: number | string | Array<number | string> | undefined) => [formatRupees(typeof val === 'number' ? val : 0), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#111722',
                        borderColor: '#202A3A',
                        borderRadius: '12px',
                        color: '#F1F5F9',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend list */}
              <div className="w-full sm:w-1/2 space-y-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 dark:text-[#A7B2C4] font-medium truncate max-w-[110px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 dark:text-[#F1F5F9]">
                      {formatRupees(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Expense Items (Bar Chart) */}
        <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-[#111722] border border-stone-200/90 dark:border-[#202A3A] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-[rgba(34,201,151,0.12)] text-emerald-600 dark:text-[#22C997] border border-transparent dark:border-[rgba(34,201,151,0.25)] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-[#A7B2C4]">
              Top 5 Expensive Line Items
            </h4>
          </div>

          {topExpenseItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-[#718096]">
              No items recorded yet.
            </div>
          ) : (
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topExpenseItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#202A3A" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#718096' }} stroke="#202A3A" />
                  <YAxis tick={{ fontSize: 10, fill: '#718096' }} stroke="#202A3A" />
                  <RechartsTooltip
                    formatter={(val: number | string | Array<number | string> | undefined) => [formatRupees(typeof val === 'number' ? val : 0), 'Price']}
                    contentStyle={{
                      backgroundColor: '#111722',
                      borderColor: '#202A3A',
                      borderRadius: '12px',
                      color: '#F1F5F9',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="price" fill="#4F7CFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 3. Quick Highlight Summary Chips */}
      {highestItem && (
        <div className="p-4 rounded-[16px] bg-stone-50 dark:bg-[#151D2A] border border-stone-200/80 dark:border-[#202A3A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-[rgba(245,184,61,0.12)] border border-transparent dark:border-[rgba(245,184,61,0.25)] text-amber-600 dark:text-[#F5B83D] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#718096] tracking-wider">
                Highest Expense Entry:
              </span>
              <p className="font-bold text-slate-900 dark:text-[#F1F5F9] text-xs sm:text-sm">
                {highestItem.productName} ({formatRupees(highestItem.price)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-[#718096]">
            <Package className="w-4 h-4 text-slate-400 dark:text-[#718096]" />
            <span>Category: <strong className="text-slate-800 dark:text-[#F1F5F9]">{highestItem.category || 'General'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
