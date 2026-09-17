import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Trash2, Download, X } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface BatchActionBarProps {
  selectedCount: number;
  selectedTotalAmount: number;
  onApproveAll: () => void;
  onMarkPendingAll: () => void;
  onDeleteAll: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  selectedTotalAmount,
  onApproveAll,
  onMarkPendingAll,
  onDeleteAll,
  onExportSelected,
  onClearSelection,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-stone-300/80 dark:border-neutral-800 shadow-2xl rounded-2xl p-2.5 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          {/* Selected Summary */}
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[11px]">
              {selectedCount}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              Selected
            </span>
            <span className="text-slate-400 dark:text-neutral-500">&bull;</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              ${selectedTotalAmount.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Tooltip content="Batch approve all selected expenses" position="top">
              <button
                type="button"
                onClick={onApproveAll}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Approve</span>
              </button>
            </Tooltip>

            <Tooltip content="Mark all selected as pending review" position="top">
              <button
                type="button"
                onClick={onMarkPendingAll}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pending</span>
              </button>
            </Tooltip>

            <Tooltip content="Export selected rows to CSV" position="top">
              <button
                type="button"
                onClick={onExportSelected}
                className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-neutral-900 hover:bg-stone-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </Tooltip>

            <Tooltip content="Batch delete selected records" position="top">
              <button
                type="button"
                onClick={onDeleteAll}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </Tooltip>

            <div className="w-[1px] h-4 bg-stone-200 dark:bg-neutral-800 mx-1" />

            <Tooltip content="Clear selection" position="top">
              <button
                type="button"
                onClick={onClearSelection}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
