import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { ModalWrapper } from './ui/ModalWrapper';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  itemDetails?: string;
  message?: string;
  confirmText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  itemName,
  itemDetails,
  message,
  confirmText = 'Yes, Delete',
}) => {
  const handleConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onConfirm();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="This action cannot be undone"
      icon={
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-[rgba(241,91,108,0.12)] text-rose-600 dark:text-[#F15B6C] border border-transparent dark:border-[rgba(241,91,108,0.25)] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      }
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-[9px] bg-[#F15B6C] hover:bg-[#E04B5C] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(241,91,108,0.25)] cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-[#F1F5F9] font-sans leading-relaxed">
          {message || 'Are you sure you want to delete this item permanently?'}
        </p>

        {itemName && (
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#151D2A] border border-stone-200/80 dark:border-[#202A3A]">
            <p className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
              {itemName}
            </p>
            {itemDetails && (
              <p className="text-[11px] text-slate-500 dark:text-[#718096] font-mono mt-0.5">
                {itemDetails}
              </p>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
