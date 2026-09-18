import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  icon,
  className = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 sm:py-1.5 rounded-[9px] border border-slate-300 dark:border-[#202A3A] dark:hover:border-[#344158] bg-white dark:bg-[#111722] dark:hover:bg-[#151D2A] text-slate-900 dark:text-[#F1F5F9] text-xs font-semibold hover:border-blue-500/60 transition-all cursor-pointer shadow-xs focus:outline-none dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)] ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {icon && <span className="text-slate-500 dark:text-[#718096] shrink-0">{icon}</span>}
          {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate text-slate-900 dark:text-[#F1F5F9]">{selectedOption.label}</span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-[#718096] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-[#4F7CFF]' : ''
          }`}
        />
      </button>

      {/* Modern Custom Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-1 min-w-[140px] max-h-60 overflow-y-auto rounded-[14px] bg-white dark:bg-[#111722] border border-slate-200 dark:border-[#202A3A] shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)] p-1 space-y-0.5 touch-scroll no-scrollbar"
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[9px] text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-[rgba(79,124,255,0.12)] text-blue-700 dark:text-[#F1F5F9] font-bold'
                      : 'text-slate-800 dark:text-[#A7B2C4] hover:bg-slate-100 dark:hover:bg-[#151D2A] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF] shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
