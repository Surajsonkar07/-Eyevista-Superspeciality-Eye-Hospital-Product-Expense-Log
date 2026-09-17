import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit3,
  Copy,
  Clock,
  IndianRupee,
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Calendar,
  Info,
  Check,
  Trash2,
} from 'lucide-react';
import { ProductExpense, SortOption } from '../types';
import { formatRupees, getAutoDateTime } from '../utils/formatters';
import { PRODUCT_CATEGORIES } from '../data/mockData';
import { Tooltip } from './ui/Tooltip';
import { CustomSelect } from './ui/CustomSelect';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ProductLogTableProps {
  products: ProductExpense[];
  activeSheetName?: string;
  onAddProduct: (product: Omit<ProductExpense, 'id'>) => void;
  onEditProduct: (product: ProductExpense) => void;
  onDuplicateProduct: (product: ProductExpense) => void;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductLogTable: React.FC<ProductLogTableProps> = ({
  products,
  activeSheetName,
  onAddProduct,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
}) => {
  // Deleting item state for confirmation modal
  const [deletingProduct, setDeletingProduct] = useState<ProductExpense | null>(null);

  // Quick inline add states
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState<number | ''>('');
  const [quickAdditionalInfo, setQuickAdditionalInfo] = useState('');
  const [quickCategory, setQuickCategory] = useState('Medical Supplies');

  // Search & Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Fast inline submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || quickPrice === '' || isNaN(Number(quickPrice))) return;

    const autoDT = getAutoDateTime();
    onAddProduct({
      productName: quickName.trim(),
      price: Number(quickPrice),
      additionalInfo: quickAdditionalInfo.trim() || undefined,
      timestamp: autoDT.timestamp,
      date: autoDT.date,
      time: autoDT.time,
      category: quickCategory,
    });

    setQuickName('');
    setQuickPrice('');
    setQuickAdditionalInfo('');
  };

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesSearch =
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.additionalInfo && item.additionalInfo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.date.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat =
          selectedCategory === 'all' || item.category === selectedCategory;

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        if (sortBy === 'price_high') {
          return b.price - a.price;
        }
        if (sortBy === 'price_low') {
          return a.price - b.price;
        }
        if (sortBy === 'name_asc') {
          return a.productName.localeCompare(b.productName);
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const currentAutoTime = getAutoDateTime().fullDisplay;

  return (
    <div className="space-y-4">
      {/* 1. Fast Inline Quick Add Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                  Quick Entry
                </h3>
                {activeSheetName && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                    {activeSheetName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type product name, price &amp; additional info &mdash; logged directly to this sheet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Auto: {currentAutoTime}</span>
          </div>
        </div>

        <form
          onSubmit={handleQuickAdd}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
        >
          {/* Product Name Input */}
          <div className="sm:col-span-4">
            <input
              type="text"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              placeholder="Product Name (e.g. Toric Lens Pack, Eye Drops)..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Price (Rupees ₹) Input */}
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 font-bold font-mono text-xs">
              ₹
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={quickPrice}
              onChange={(e) =>
                setQuickPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              placeholder="Price in ₹"
              required
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-stone-300 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Additional Information Input */}
          <div className="sm:col-span-3">
            <input
              type="text"
              value={quickAdditionalInfo}
              onChange={(e) => setQuickAdditionalInfo(e.target.value)}
              placeholder="Additional Info (Batch, Supplier, Notes)..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-2">
            <CustomSelect
              options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={quickCategory}
              onChange={setQuickCategory}
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={!quickName.trim() || quickPrice === ''}
              className="w-full py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[38px] sm:min-h-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Search, Category Filters, and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white dark:bg-neutral-950 p-3 sm:p-3.5 rounded-2xl border border-stone-200/90 dark:border-neutral-800 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, info, or date..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 rounded-xl border border-stone-200 dark:border-neutral-800 bg-stone-50/70 dark:bg-neutral-900/70 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Category filter */}
          <div className="w-full sm:w-44">
            <CustomSelect
              options={[
                { value: 'all', label: 'All Categories' },
                ...PRODUCT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={<Filter className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Sort selector */}
          <div className="w-full sm:w-44">
            <CustomSelect
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'price_high', label: 'Price: High-Low' },
                { value: 'price_low', label: 'Price: Low-High' },
                { value: 'name_asc', label: 'Name: A-Z' },
              ]}
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            />
          </div>
        </div>
      </div>

      {/* 3. Product Log Items List */}
      <div className="rounded-2xl bg-white dark:bg-neutral-950 border border-stone-200/90 dark:border-neutral-800 overflow-hidden shadow-xs">
        {/* Table Header (Desktop only) */}
        <div className="hidden sm:grid grid-cols-12 px-5 py-3 border-b border-stone-200/80 dark:border-neutral-800 bg-stone-50/80 dark:bg-neutral-900/60 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
          <div className="col-span-5">Product Name &amp; Details</div>
          <div className="col-span-3 text-right">Price (Rupees ₹)</div>
          <div className="col-span-3 pl-4">Auto-Matched Date &amp; Time</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-neutral-900 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
              No products found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try clearing your search or category filter.'
                : 'Log your first product name and price using the quick bar above.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-neutral-900">
            {filteredProducts.map((item) => (
              <div key={item.id}>
                {/* Desktop View (sm:grid) */}
                <div className="hidden sm:grid grid-cols-12 px-5 py-3.5 hover:bg-stone-50/60 dark:hover:bg-neutral-900/40 transition-colors items-center">
                  {/* 1. Product Name & Category */}
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white font-display truncate">
                        {item.productName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300 border border-stone-200/60 dark:border-neutral-800 shrink-0">
                        {item.category || 'General'}
                      </span>
                    </div>
                    {item.additionalInfo && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider shrink-0">
                          Info:
                        </span>
                        <span className="truncate">{item.additionalInfo}</span>
                      </p>
                    )}
                    {item.notes && !item.additionalInfo && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* 2. Price in Rupees (₹) */}
                  <div className="col-span-3 text-right">
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatRupees(item.price)}
                    </span>
                  </div>

                  {/* 3. Logged Date & Time */}
                  <div className="col-span-3 pl-4 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="font-mono">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.date}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 ml-1.5">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  {/* 4. Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <Tooltip content="Edit product" position="top">
                      <button
                        type="button"
                        onClick={() => onEditProduct(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        aria-label="Edit product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    <Tooltip content="Duplicate entry" position="top">
                      <button
                        type="button"
                        onClick={() => onDuplicateProduct(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        aria-label="Duplicate entry"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>

                    {onDeleteProduct && (
                      <Tooltip content="Delete entry" position="top">
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500/80 hover:text-rose-600" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Mobile View Card (<sm) */}
                <div className="sm:hidden p-3.5 space-y-2.5 hover:bg-stone-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                          {item.productName}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-stone-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300 border border-stone-200/60 dark:border-neutral-800 shrink-0">
                          {item.category || 'General'}
                        </span>
                      </div>
                      {item.additionalInfo && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          <span className="font-semibold text-slate-400 text-[9px] uppercase tracking-wider mr-1">
                            Info:
                          </span>
                          {item.additionalInfo}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatRupees(item.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-neutral-900 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.date}</span>
                      <span className="text-slate-400 ml-1">{item.time}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 bg-stone-100 dark:bg-neutral-900 active:scale-95 text-[11px] font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateProduct(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 bg-stone-100 dark:bg-neutral-900 active:scale-95 text-[11px] font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                      {onDeleteProduct && (
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 active:scale-95 text-[11px] font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Summary */}
        <div className="px-4 sm:px-5 py-3 border-t border-stone-200/80 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {filteredProducts.length} of {products.length} logged products
          </span>
        </div>
      </div>

      {/* Confirmation Modal before item deletion */}
      <ConfirmDeleteModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct && onDeleteProduct) {
            onDeleteProduct(deletingProduct.id);
          }
        }}
        title="Delete Product Entry"
        itemName={deletingProduct?.productName}
        itemDetails={
          deletingProduct
            ? `${formatRupees(deletingProduct.price)} • ${deletingProduct.category || 'General'}`
            : undefined
        }
        message="Are you sure you want to delete this product entry? It will be removed permanently."
      />
    </div>
  );
};

