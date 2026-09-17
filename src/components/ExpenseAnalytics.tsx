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
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Expense Analytics &amp; Insights
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {sheet.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live breakdown of category allocations, top spend items, and budget utilization in Rupees (₹)
            </p>
          </div>

          {/* Budget Limit Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isOverBudget ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Over Budget ({budgetPercentage}%)</span>
              </div>
            ) : isNearBudget ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Near Limit ({budgetPercentage}%)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Budget Healthy ({budgetPercentage}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500 dark:text-slate-400">
              Budget Used: <strong className="font-mono text-slate-900 dark:text-white">{formatRupees(totalSpent)}</strong> of <span className="font-mono">{formatRupees(budgetLimit)}</span>
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {budgetPercentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-stone-100 dark:bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-stone-200/60 dark:border-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : isNearBudget
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown (Donut Chart) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Expense Distribution by Category
            </h4>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
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
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
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
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[110px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {formatRupees(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Expense Items (Bar Chart) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Top 5 Expensive Line Items
            </h4>
          </div>

          {topExpenseItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No items recorded yet.
            </div>
          ) : (
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topExpenseItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <RechartsTooltip
                    formatter={(val: number | string | Array<number | string> | undefined) => [formatRupees(typeof val === 'number' ? val : 0), 'Price']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="price" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 3. Quick Highlight Summary Chips */}
      {highestItem && (
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-neutral-900/60 border border-stone-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Highest Expense Entry:
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {highestItem.productName} ({formatRupees(highestItem.price)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Package className="w-4 h-4 text-slate-400" />
            <span>Category: <strong className="text-slate-800 dark:text-slate-200">{highestItem.category || 'General'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
