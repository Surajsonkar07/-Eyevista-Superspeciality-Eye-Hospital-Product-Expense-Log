import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Edit2,
  Copy,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { Sheet } from '../types';
import { formatRupees } from '../utils/formatters';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onCreateSheet: (name: string) => void;
  onRenameSheet: (id: string, newName: string) => void;
  onDuplicateSheet: (id: string) => void;
  onUpdateBudget?: (sheetId: string, limit: number) => void;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onCreateSheet,
  onRenameSheet,
  onDuplicateSheet,
  onUpdateBudget,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>('');

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewSheetName(`Sheet ${sheets.length + 1}`);
  };

  const handleConfirmCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSheetName.trim();
    if (trimmed) {
      onCreateSheet(trimmed);
      setIsCreating(false);
      setNewSheetName('');
      setTimeout(() => {
        if (tabsContainerRef.current) {
          tabsContainerRef.current.scrollLeft = tabsContainerRef.current.scrollWidth;
        }
      }, 50);
    }
  };

  const handleStartRename = (sheet: Sheet) => {
    setEditingSheetId(sheet.id);
    setRenameValue(sheet.name);
  };

  const handleConfirmRename = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed) {
      onRenameSheet(id, trimmed);
    }
    setEditingSheetId(null);
  };

  const handleSaveBudget = (sheetId: string) => {
    const num = parseFloat(budgetInput);
    if (!isNaN(num) && num >= 0 && onUpdateBudget) {
      onUpdateBudget(sheetId, num);
    }
    setEditingBudgetId(null);
  };

  const filteredDropdownSheets = sheets.filter((s) =>
    s.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200/80 dark:border-neutral-800 p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2 border-b border-stone-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Department Expense Sheets
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-neutral-800 text-slate-500 font-medium font-mono">
            {sheets.length} Shared {sheets.length === 1 ? 'Sheet' : 'Sheets'}
          </span>
        </div>

        {/* Modern Sheet Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100/80 dark:bg-neutral-800/80 border border-stone-200/90 dark:border-neutral-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-stone-200/70 dark:hover:bg-neutral-700 transition-all cursor-pointer min-h-[36px]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="truncate max-w-[130px] sm:max-w-[180px]">
              Active: {activeSheet.name}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              ({activeSheet.products.length})
            </span>
            <span className="text-slate-400 ml-0.5">&ndash;&rsaquo;</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-2.5 space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 dark:bg-neutral-900 rounded-xl border border-stone-200/70 dark:border-neutral-800">
                <input
                  type="text"
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  placeholder="Search department sheet..."
                  className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  autoFocus
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 touch-scroll">
                {filteredDropdownSheets.map((sheet) => {
                  const isSelected = sheet.id === activeSheetId;
                  const total = sheet.products.reduce((acc, p) => acc + p.price, 0);

                  return (
                    <div
                      key={sheet.id}
                      onClick={() => {
                        onSelectSheet(sheet.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'hover:bg-stone-50 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <FileSpreadsheet
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs truncate font-medium">{sheet.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {sheet.products.length} products &bull; {formatRupees(total)}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs list with smooth horizontal touch scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 touch-scroll no-scrollbar" ref={tabsContainerRef}>
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          const isEditingThis = editingSheetId === sheet.id;
          const sheetTotal = sheet.products.reduce((acc, p) => acc + p.price, 0);

          if (isEditingThis) {
            return (
              <div
                key={sheet.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-blue-500 bg-white dark:bg-neutral-950 shrink-0 shadow-xs min-h-[40px]"
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename(sheet.id);
                    if (e.key === 'Escape') setEditingSheetId(null);
                  }}
                  autoFocus
                  className="text-xs font-semibold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none w-32 sm:w-36"
                />
                <button
                  type="button"
                  onClick={() => handleConfirmRename(sheet.id)}
                  className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  title="Save Name"
                >
                  <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSheetId(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  title="Cancel"
                >
                  <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={sheet.id}
              className={`group relative flex items-center gap-2 px-3 py-2 sm:py-2 rounded-xl transition-all cursor-pointer select-none shrink-0 border min-h-[40px] ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold'
                  : 'bg-stone-50 dark:bg-neutral-800/70 text-slate-700 dark:text-slate-300 border-stone-200/80 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-800'
              }`}
              onClick={() => onSelectSheet(sheet.id)}
            >
              <FileSpreadsheet
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="text-xs font-medium tracking-tight whitespace-nowrap">
                {sheet.name}
              </span>

              {/* Badges: count & total */}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono shrink-0 ${
                  isActive
                    ? 'bg-blue-700 text-blue-100'
                    : 'bg-stone-200/70 dark:bg-neutral-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {sheet.products.length}
              </span>

              <span
                className={`text-[10px] font-mono hidden md:inline-block shrink-0 ${
                  isActive ? 'text-blue-100 font-normal' : 'text-slate-400'
                }`}
              >
                ({formatRupees(sheetTotal)})
              </span>

              {/* Quick Tab Actions (Rename, Duplicate) */}
              <div
                className="flex items-center gap-0.5 ml-1 opacity-80 sm:opacity-60 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleStartRename(sheet)}
                  title="Rename Sheet"
                  className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateSheet(sheet.id)}
                  title="Duplicate Sheet"
                  className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Inline Create Input or Button */}
        {isCreating ? (
          <form
            onSubmit={handleConfirmCreate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-dashed border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shrink-0 min-h-[40px]"
          >
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Sheet Name..."
              autoFocus
              className="text-xs font-medium text-slate-900 dark:text-white bg-transparent border-none focus:outline-none w-36 sm:w-44 placeholder-slate-400"
            />
            <button
              type="submit"
              className="p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              title="Add Sheet"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-md text-slate-400 hover:bg-slate-200 dark:hover:bg-neutral-800 cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-neutral-700 hover:border-blue-500 hover:text-blue-600 text-slate-600 dark:text-slate-400 dark:hover:text-blue-400 bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-xs font-semibold shrink-0 cursor-pointer min-h-[40px]"
            title="Create New Sheet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sheet</span>
          </button>
        )}
      </div>
    </div>
  );
};
