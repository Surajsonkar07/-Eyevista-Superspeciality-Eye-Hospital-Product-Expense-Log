import React, { useState, useEffect } from 'react';
import { Package, Clock, IndianRupee, Tag, Info, Check } from 'lucide-react';
import { ProductExpense } from '../types';
import { ModalWrapper } from './ui/ModalWrapper';
import { getAutoDateTime } from '../utils/formatters';
import { PRODUCT_CATEGORIES } from '../data/mockData';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<ProductExpense, 'id'>) => void;
  onUpdate?: (product: ProductExpense) => void;
  initialProduct?: ProductExpense | null;
  sheetName?: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialProduct,
  sheetName,
}) => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [category, setCategory] = useState('Medical Supplies');
  const [liveAutoTime, setLiveAutoTime] = useState(getAutoDateTime().fullDisplay);

  // Update live auto timestamp every few seconds when open in add mode
  useEffect(() => {
    if (!isOpen) return;

    if (initialProduct) {
      setProductName(initialProduct.productName);
      setPrice(initialProduct.price);
      setAdditionalInfo(initialProduct.additionalInfo || initialProduct.notes || '');
      setCategory(initialProduct.category || 'Medical Supplies');
      setLiveAutoTime(`${initialProduct.date} at ${initialProduct.time}`);
    } else {
      setProductName('');
      setPrice('');
      setAdditionalInfo('');
      setCategory('Medical Supplies');
      setLiveAutoTime(getAutoDateTime().fullDisplay);

      const interval = setInterval(() => {
        setLiveAutoTime(getAutoDateTime().fullDisplay);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, initialProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || price === '' || isNaN(Number(price))) return;

    const numPrice = Number(price);

    if (initialProduct && onUpdate) {
      onUpdate({
        ...initialProduct,
        productName: productName.trim(),
        price: numPrice,
        additionalInfo: additionalInfo.trim() || undefined,
        category,
      });
    } else {
      const autoDT = getAutoDateTime();
      onSave({
        productName: productName.trim(),
        price: numPrice,
        additionalInfo: additionalInfo.trim() || undefined,
        timestamp: autoDT.timestamp,
        date: autoDT.date,
        time: autoDT.time,
        category,
      });
    }

    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Edit Product' : 'Submit Product & Price'}
      subtitle={
        sheetName
          ? `Logging to sheet "${sheetName}" in Rupees (₹) with automatic timestamp`
          : 'Simple expense log with automatic date and time matching in Rupees (₹)'
      }
      icon={
        <div className="w-8 h-8 rounded-lg bg-[#4F7CFF] flex items-center justify-center text-white shadow-xs">
          <Package className="w-4 h-4" />
        </div>
      }
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!productName.trim() || price === ''}
            className="px-5 py-2 rounded-[9px] bg-[#4F7CFF] hover:bg-[#638DFF] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(79,124,255,0.25)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Auto-matched Date and Time banner */}
        <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-[rgba(34,201,151,0.08)] border border-emerald-200/80 dark:border-[rgba(34,201,151,0.25)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-[#22C997] shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-emerald-900 dark:text-[#22C997]">
                Auto-Matched Date &amp; Time
              </p>
              <p className="text-xs font-mono font-bold text-emerald-700 dark:text-[#22C997]">
                {liveAutoTime}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200/70 dark:bg-[rgba(34,201,151,0.18)] text-emerald-800 dark:text-[#22C997]">
            Live Matched
          </span>
        </div>

        {/* 1. Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] mb-1.5 font-sans">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. AcrySof Toric IOL Pack or Eye Drops 10ml"
              required
              className="w-full px-3.5 py-2.5 rounded-[9px] border border-stone-300 dark:border-[#202A3A] dark:hover:border-[#344158] bg-white dark:bg-[#0D131E] text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#718096] text-xs sm:text-sm focus:border-blue-500 dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* 2. Price in Rupees (₹) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] mb-1.5 font-sans">
            Price in Rupees (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-[#718096] font-bold font-mono">
              ₹
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="0.00"
              required
              className="w-full pl-8 pr-3.5 py-2.5 rounded-[9px] border border-stone-300 dark:border-[#202A3A] dark:hover:border-[#344158] bg-white dark:bg-[#0D131E] text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#718096] text-sm font-mono font-bold focus:border-blue-500 dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)] focus:outline-none transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#718096] mt-1">
            Amount will be recorded exclusively in Indian Rupees (₹).
          </p>
        </div>

        {/* 3. Additional Information Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] mb-1.5 font-sans flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF]" />
            <span>Additional Information</span>
          </label>
          <input
            type="text"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="e.g. Supplier name, Batch/Lot number, OT Suite or remarks..."
            className="w-full px-3.5 py-2.5 rounded-[9px] border border-stone-300 dark:border-[#202A3A] dark:hover:border-[#344158] bg-white dark:bg-[#0D131E] text-slate-900 dark:text-[#F1F5F9] placeholder-slate-400 dark:placeholder-[#718096] text-xs sm:text-sm focus:border-blue-500 dark:focus:border-[#4F7CFF] dark:focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)] focus:outline-none transition-all"
          />
        </div>

        {/* 4. Category (Optional / Quick Chips) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-[#F1F5F9] mb-1.5 font-sans flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-[#718096]" />
            <span>Category (Optional)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#4F7CFF] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-[#151D2A] text-slate-600 dark:text-[#A7B2C4] border border-transparent dark:border-[#202A3A] hover:bg-stone-200/70 dark:hover:border-[#344158]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};
