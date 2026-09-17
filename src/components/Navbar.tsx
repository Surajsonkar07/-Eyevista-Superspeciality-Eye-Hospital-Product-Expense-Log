import React from 'react';
import { Sun, Moon, Plus, Download, Printer, BarChart3, Table, RefreshCw } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { formatRupees } from '../utils/formatters';

interface NavbarProps {
  totalSpent: number;
  totalCount: number;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onOpenPrintModal?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  viewMode?: 'table' | 'analytics';
  onToggleViewMode?: (mode: 'table' | 'analytics') => void;
  isSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalSpent,
  totalCount,
  onOpenAddModal,
  onExportCSV,
  onOpenPrintModal,
  darkMode,
  onToggleDarkMode,
  viewMode = 'table',
  onToggleViewMode,
  isSynced = true,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-200 bg-white/95 dark:bg-[#090D16]/95 border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-9 sm:h-11 px-1.5 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-stone-200/80 dark:border-neutral-800 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img
                src="/eyevista-logo.png"
                alt="Eyevista Superspeciality Eye Hospital Logo"
                className="h-7 sm:h-9 w-auto max-w-[85px] sm:max-w-[110px] object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://www.eyevistahospital.com/Photos/logo.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="text-sm sm:text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  Eyevista
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md border border-emerald-300/60 dark:border-emerald-800 font-mono shrink-0">
                  Rupees (₹)
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 tracking-tight leading-tight truncate hidden xs:block">
                Superspeciality Eye Hospital
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* View Mode Toggle (Log Table vs Analytics) */}
            {onToggleViewMode && (
              <div className="flex items-center p-0.5 bg-stone-200/80 dark:bg-neutral-800 rounded-xl border border-stone-300/80 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => onToggleViewMode('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Expense Log Table"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Log</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleViewMode('analytics')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'analytics'
                      ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Visual Analytics & Donut Charts"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Analytics</span>
                </button>
              </div>
            )}

            {/* Print Official Report Button */}
            {onOpenPrintModal && (
              <Tooltip content="Print official hospital expense report" position="bottom">
                <button
                  type="button"
                  onClick={onOpenPrintModal}
                  className="hidden sm:flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200 border border-stone-300/80 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
                  aria-label="Print Hospital Report"
                >
                  <Printer className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden lg:inline ml-1.5">Print Report</span>
                </button>
              </Tooltip>
            )}

            {/* Export CSV button */}
            <Tooltip content="Export product log to CSV" position="bottom">
              <button
                type="button"
                onClick={onExportCSV}
                className="hidden md:flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200 border border-stone-300/80 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
                aria-label="Export CSV"
              >
                <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline ml-1.5">Export</span>
              </button>
            </Tooltip>

            {/* Dark / Light Mode Toggle */}
            <Tooltip content={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} position="bottom">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-stone-200/60 dark:hover:bg-neutral-900 transition-colors cursor-pointer active:scale-95 min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            </Tooltip>

            {/* Submit Product Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer min-h-[38px] sm:min-h-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
