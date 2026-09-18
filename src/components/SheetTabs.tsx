import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Edit2,
  Copy,
  Check,
  X,
  Layers,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Sheet } from '../types';
import { formatRupees } from '../utils/formatters';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onCreateSheet: (name: string) => void;
  onRenameSheet: (id: string, newName: string) => void;
  onDuplicateSheet: (id: string) => void;
  onDeleteSheet?: (id: string) => void;
  onUpdateBudget?: (sheetId: string, limit: number) => void;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onCreateSheet,
  onRenameSheet,
  onDuplicateSheet,
  onDeleteSheet,
  onUpdateBudget,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [deletingSheet, setDeletingSheet] = useState<Sheet | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [openMenuSheetId, setOpenMenuSheetId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0] || null;
  const activeMenuSheet = sheets.find((s) => s.id === openMenuSheetId);

  // Close dropdown on outside click or scroll
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenuSheetId(null);
        setMenuPosition(null);
      }
    };

    const handleScroll = () => {
      if (openMenuSheetId) {
        setOpenMenuSheetId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openMenuSheetId]);

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
    <div className="bg-white dark:bg-[#111722] rounded-2xl border border-stone-200/80 dark:border-[#202A3A] p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2 border-b border-stone-100 dark:border-[#202A3A]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-[#1A2A4A] text-blue-600 dark:text-[#4F7CFF] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-[#F1F5F9]">
            Department Expense Sheets
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/[0.05] text-slate-500 dark:text-[#A7B2C4] font-medium font-mono">
            {sheets.length} Shared {sheets.length === 1 ? 'Sheet' : 'Sheets'}
          </span>
        </div>

        {/* Modern Sheet Switcher Dropdown */}
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full sm:w-auto gap-2 px-3 py-1.5 rounded-xl bg-stone-100/80 dark:bg-[#151D2A] border border-stone-200/90 dark:border-[#202A3A] text-slate-800 dark:text-[#F1F5F9] text-xs font-semibold hover:bg-stone-200/70 dark:hover:bg-[#1A2333] dark:hover:border-[#344158] transition-all cursor-pointer min-h-[36px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF] shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-[180px]">
                Active: {activeSheet ? activeSheet.name : 'None'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-mono text-slate-500 dark:text-[#718096]">
                ({activeSheet ? activeSheet.products.length : 0})
              </span>
              <span className="text-slate-400 dark:text-[#718096] ml-0.5">&ndash;&rsaquo;</span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-full sm:w-80 bg-white/95 dark:bg-[#151D2A] backdrop-blur-xl border border-stone-200 dark:border-[#202A3A] rounded-2xl shadow-xl z-50 p-2.5 space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 dark:bg-[#0D131E] rounded-xl border border-stone-200/70 dark:border-[#202A3A]">
                <input
                  type="text"
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  placeholder="Search department sheet..."
                  className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#718096]"
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
                          ? 'bg-blue-50 dark:bg-[rgba(79,124,255,0.15)] border border-blue-200 dark:border-[rgba(79,124,255,0.45)] text-blue-900 dark:text-[#F1F5FF] font-semibold'
                          : 'hover:bg-stone-50 dark:hover:bg-[#111722] text-slate-700 dark:text-[#A7B2C4]'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <FileSpreadsheet
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-blue-600 dark:text-[#4F7CFF]' : 'text-slate-400 dark:text-[#718096]'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs truncate font-medium">{sheet.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-[#718096] font-mono">
                            {sheet.products.length} products &bull; {formatRupees(total)}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-[#4F7CFF] shrink-0" />
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-blue-500 dark:border-[#4F7CFF] bg-white dark:bg-[#111722] shrink-0 shadow-xs min-h-[40px]"
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
                  className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] bg-transparent border-none focus:outline-none w-32 sm:w-36"
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
                  className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-[#151D2A] cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
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
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold dark:bg-[rgba(79,124,255,0.15)] dark:border-[rgba(79,124,255,0.45)] dark:text-[#F1F5FF] dark:shadow-none'
                  : 'bg-stone-50 dark:bg-[#151D2A] text-slate-700 dark:text-[#A7B2C4] border-stone-200/80 dark:border-[#202A3A] hover:bg-stone-100 dark:hover:bg-[#192333] dark:hover:border-[#344158]'
              }`}
              onClick={() => onSelectSheet(sheet.id)}
            >
              <FileSpreadsheet
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? 'text-white dark:text-[#4F7CFF]' : 'text-slate-400 dark:text-[#718096]'
                }`}
              />
              <span className="text-xs font-medium tracking-tight whitespace-nowrap">
                {sheet.name}
              </span>

              {/* Badges: count & total */}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono shrink-0 ${
                  isActive
                    ? 'bg-blue-700 text-blue-100 dark:bg-[#1A2A4A] dark:text-[#638DFF]'
                    : 'bg-stone-200/70 dark:bg-[#0D131E] text-slate-600 dark:text-[#A7B2C4]'
                }`}
              >
                {sheet.products.length}
              </span>

              <span
                className={`text-[10px] font-mono hidden md:inline-block shrink-0 ${
                  isActive ? 'text-blue-100 dark:text-[#A7B2C4] font-normal' : 'text-slate-400 dark:text-[#718096]'
                }`}
              >
                ({formatRupees(sheetTotal)})
              </span>

              {/* Sheet Tab Action Menu (Rename, Duplicate, Delete) */}
              <div
                className="relative flex items-center ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openMenuSheetId === sheet.id) {
                      setOpenMenuSheetId(null);
                      setMenuPosition(null);
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: rect.bottom + 6,
                        right: Math.max(10, window.innerWidth - rect.right),
                      });
                      setOpenMenuSheetId(sheet.id);
                    }
                  }}
                  title="Sheet Options Menu"
                  className={`p-1 rounded-md transition-all cursor-pointer ${
                    openMenuSheetId === sheet.id
                      ? 'bg-black/20 dark:bg-white/15 text-white'
                      : isActive
                      ? 'text-white/80 hover:text-white dark:text-[#A7B2C4] dark:hover:text-[#F1F5F9] hover:bg-black/10 dark:hover:bg-white/10'
                      : 'text-slate-400 dark:text-[#718096] hover:text-slate-700 dark:hover:text-[#F1F5F9] hover:bg-stone-200/60 dark:hover:bg-[#202A3A]'
                  }`}
                  aria-haspopup="true"
                  aria-expanded={openMenuSheetId === sheet.id}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Inline Create Input or Button */}
        {isCreating ? (
          <form
            onSubmit={handleConfirmCreate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-dashed border-[#4F7CFF] bg-blue-50/50 dark:bg-[#1A2A4A]/50 shrink-0 min-h-[40px]"
          >
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Sheet Name..."
              autoFocus
              className="text-xs font-medium text-slate-900 dark:text-[#F1F5F9] bg-transparent border-none focus:outline-none w-36 sm:w-44 placeholder-slate-400 dark:placeholder-[#718096]"
            />
            <button
              type="submit"
              className="p-1 rounded-md bg-[#4F7CFF] text-white hover:bg-[#638DFF] cursor-pointer"
              title="Add Sheet"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-md text-slate-400 dark:text-[#718096] hover:bg-slate-200 dark:hover:bg-[#151D2A] cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-[#202A3A] hover:border-blue-500 dark:hover:border-[#344158] text-slate-600 dark:text-[#A7B2C4] hover:text-blue-600 dark:hover:text-[#F1F5F9] bg-transparent dark:bg-[#151D2A] hover:bg-blue-50/50 dark:hover:bg-[#192333] transition-all text-xs font-semibold shrink-0 cursor-pointer min-h-[40px]"
            title="Create New Sheet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sheet</span>
          </button>
        )}
      </div>

      {/* Popover Sheet Actions Menu positioned outside overflow container */}
      {openMenuSheetId && menuPosition && activeMenuSheet && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 9999,
          }}
          className="w-36 rounded-xl bg-white dark:bg-[#151D2A] border border-stone-200 dark:border-[#202A3A] shadow-2xl dark:shadow-[0_12px_30px_rgba(0,0,0,0.60)] p-1 space-y-0.5 animate-fade-in text-left backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              handleStartRename(activeMenuSheet);
              setOpenMenuSheetId(null);
              setMenuPosition(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#F1F5F9] hover:bg-stone-100 dark:hover:bg-[#1A2436] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF]" />
            <span>Rename</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDuplicateSheet(activeMenuSheet.id);
              setOpenMenuSheetId(null);
              setMenuPosition(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#F1F5F9] hover:bg-stone-100 dark:hover:bg-[#1A2436] transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-[#638DFF]" />
            <span>Duplicate</span>
          </button>

          {onDeleteSheet && sheets.length > 1 && (
            <div className="pt-0.5 border-t border-stone-100 dark:border-[#202A3A]">
              <button
                type="button"
                onClick={() => {
                  setDeletingSheet(activeMenuSheet);
                  setOpenMenuSheetId(null);
                  setMenuPosition(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-[#F15B6C] hover:bg-rose-50 dark:hover:bg-[rgba(241,91,108,0.12)] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal before sheet deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingSheet}
        onClose={() => setDeletingSheet(null)}
        onConfirm={() => {
          if (deletingSheet && onDeleteSheet) {
            onDeleteSheet(deletingSheet.id);
          }
        }}
        title="Delete Department Sheet"
        itemName={deletingSheet?.name}
        itemDetails={
          deletingSheet
            ? `${deletingSheet.products.length} logged expense entries`
            : undefined
        }
        message="Are you sure you want to delete this sheet? All logged products and expenses inside it will be permanently deleted."
      />
    </div>
  );
};

