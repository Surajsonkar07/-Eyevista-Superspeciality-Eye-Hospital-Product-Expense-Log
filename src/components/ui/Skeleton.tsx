import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`skeleton-shimmer rounded-xl transition-all duration-300 ${className}`}
      {...props}
    />
  );
};

// 1. KPI Stats Cards Skeleton Loader
export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-[#262626] shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-7 w-28 sm:w-32 rounded-lg" />
            </div>
            <Skeleton className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shrink-0" />
          </div>
          <div className="pt-2 border-t border-slate-200/50 dark:border-[#262626] flex items-center justify-between">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Department Sheet Tabs Skeleton Loader
export const SheetTabsSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl border border-stone-200/80 dark:border-[#262626] p-2.5 sm:p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        <Skeleton className="h-6 w-32 rounded-lg" />
      </div>
      <div className="flex items-center gap-2 overflow-x-hidden pt-1">
        <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
        <Skeleton className="h-10 w-44 rounded-xl shrink-0" />
        <Skeleton className="h-10 w-40 rounded-xl shrink-0" />
        <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
      </div>
    </div>
  );
};

// 3. Product Log Table Skeleton Loader
export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Quick Entry Form Skeleton */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-stone-200/80 dark:border-[#262626] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-6 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          <Skeleton className="sm:col-span-4 h-11 rounded-xl" />
          <Skeleton className="sm:col-span-2 h-11 rounded-xl" />
          <Skeleton className="sm:col-span-3 h-11 rounded-xl" />
          <Skeleton className="sm:col-span-2 h-11 rounded-xl" />
          <Skeleton className="sm:col-span-1 h-11 rounded-xl" />
        </div>
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-3 sm:p-3.5 rounded-2xl border border-stone-200/80 dark:border-[#262626] shadow-xs">
        <Skeleton className="h-10 w-full sm:max-w-md rounded-xl" />
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>

      {/* Main Table Skeleton */}
      <div className="rounded-2xl glass-panel border border-stone-200/80 dark:border-[#262626] overflow-hidden shadow-xs">
        {/* Table Header Skeleton */}
        <div className="hidden sm:grid grid-cols-12 px-5 py-3.5 border-b border-stone-200/80 dark:border-[#262626] bg-stone-50/70 dark:bg-[#1A1A1A]/70 gap-4">
          <Skeleton className="col-span-1 h-4 w-6 rounded" />
          <Skeleton className="col-span-3 h-4 w-32 rounded" />
          <Skeleton className="col-span-2 h-4 w-24 rounded" />
          <Skeleton className="col-span-2 h-4 w-20 rounded" />
          <Skeleton className="col-span-2 h-4 w-20 rounded" />
          <Skeleton className="col-span-2 h-4 w-16 rounded ml-auto" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-stone-200/60 dark:divide-[#262626]">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="p-4 sm:px-5 sm:py-4 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-3 sm:gap-4"
            >
              <div className="hidden sm:block col-span-1">
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <div className="col-span-12 sm:col-span-3 space-y-1.5 w-full">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
              <div className="col-span-12 sm:col-span-2 w-full">
                <Skeleton className="h-3.5 w-3/4 rounded" />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1.5 w-full">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Pagination Footer Skeleton */}
        <div className="px-5 py-3.5 border-t border-stone-200/80 dark:border-[#262626] bg-stone-50/50 dark:bg-[#1A1A1A]/50 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
