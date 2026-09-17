import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface PortalSelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PortalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (PortalSelectOption | string)[];
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const PortalSelect: React.FC<PortalSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  label,
  searchable = false,
  className = '',
  buttonClassName = '',
  align = 'left',
  size = 'md',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 200,
  });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Normalize options
  const normalizedOptions: PortalSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    // Check if dropdown fits below or should flip upward
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(260, normalizedOptions.length * 36 + 60);
    const shouldFlip = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = shouldFlip ? rect.top + scrollY - menuHeight - 4 : rect.bottom + scrollY + 4;
    let left = align === 'right' ? rect.right + scrollX - rect.width : rect.left + scrollX;

    // Ensure it doesn't overflow screen
    const minWidth = Math.max(rect.width, 180);
    if (left + minWidth > window.innerWidth - 12) {
      left = window.innerWidth - minWidth - 12;
    }
    if (left < 12) left = 12;

    setCoords({
      top,
      left,
      width: Math.max(rect.width, minWidth),
    });
  }, [align, normalizedOptions.length]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }

      const handleOutsideClick = (e: MouseEvent) => {
        if (
          triggerRef.current?.contains(e.target as Node) ||
          menuRef.current?.contains(e.target as Node)
        ) {
          return;
        }
        setIsOpen(false);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setFilterText('');
    }
  }, [isOpen, updatePosition, searchable]);

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(filterText.toLowerCase())
  );

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1.5 text-xs'
      : 'px-3 py-2 text-xs sm:text-sm';

  return (
    <div className={`relative inline-block ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 font-sans">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border border-stone-200/90 dark:border-neutral-800 bg-white/90 dark:bg-black/90 text-slate-800 dark:text-slate-200 backdrop-blur-xs font-medium transition-all hover:border-slate-300 dark:hover:border-neutral-700 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="rounded-xl bg-white/95 dark:bg-neutral-950/95 border border-stone-200/90 dark:border-neutral-800 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {searchable && (
              <div className="p-2 border-b border-stone-100 dark:border-neutral-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md bg-stone-50 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1 text-xs space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-3 px-2 text-center text-slate-400 text-xs font-sans">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-stone-100/80 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded bg-stone-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 font-mono">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
