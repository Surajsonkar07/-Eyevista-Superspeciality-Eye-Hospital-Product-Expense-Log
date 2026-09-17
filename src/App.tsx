import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { ProductExpense, Sheet } from './types';
import { INITIAL_PRODUCTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { SheetTabs } from './components/SheetTabs';
import { ProductStats } from './components/ProductStats';
import { ProductLogTable } from './components/ProductLogTable';
import { ProductModal } from './components/ProductModal';
import { ExpenseAnalytics } from './components/ExpenseAnalytics';
import { PrintReportModal } from './components/PrintReportModal';
import { exportProductsToCSV, getAutoDateTime } from './utils/formatters';
import { fetchGlobalSheets, saveGlobalSheets } from './services/api';

const DEFAULT_SHEETS: Sheet[] = [
  {
    id: 'sheet-1',
    name: 'Main OT & Consumables',
    products: INITIAL_PRODUCTS,
    createdAt: '2026-09-17T08:00:00.000Z',
    budgetLimit: 50000,
  },
  {
    id: 'sheet-2',
    name: 'Pharmacy & Drops',
    products: [],
    createdAt: '2026-09-17T08:05:00.000Z',
    budgetLimit: 30000,
  },
  {
    id: 'sheet-3',
    name: 'OPD & Diagnostics',
    products: [],
    createdAt: '2026-09-17T08:10:00.000Z',
    budgetLimit: 25000,
  },
];

export default function App() {
  // Theme state with local storage & system preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('eyevista_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('eyevista_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('eyevista_theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  // Multiple sheets state
  const [sheets, setSheets] = useState<Sheet[]>(DEFAULT_SHEETS);
  const [isSynced, setIsSynced] = useState<boolean>(true);
  const isInitialSync = useRef(true);

  // Active sheet ID state
  const [activeSheetId, setActiveSheetId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('eyevista_active_sheet_id');
      return savedId || 'sheet-1';
    } catch {
      return 'sheet-1';
    }
  });

  // View Mode ('table' vs 'analytics')
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Initial Fetch & Polling for Cross-User Realtime Shared Storage Sync
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const data = await fetchGlobalSheets();
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setSheets(data);
        setIsSynced(true);
      }
    };

    loadData();

    // Poll every 3 seconds for live updates from other sessions
    const interval = setInterval(async () => {
      const data = await fetchGlobalSheets();
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setSheets((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Save changes to API & local cache whenever sheets state mutates
  const updateSheetsState = async (updater: (prev: Sheet[]) => Sheet[]) => {
    setSheets((prev) => {
      const next = updater(prev);
      saveGlobalSheets(next);
      return next;
    });
  };

  // Save activeSheetId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eyevista_active_sheet_id', activeSheetId);
    } catch (e) {
      console.error(e);
    }
  }, [activeSheetId]);

  // Active sheet calculation
  const activeSheet =
    sheets.find((s) => s.id === activeSheetId) || sheets[0] || DEFAULT_SHEETS[0];
  const currentProducts = activeSheet?.products || [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductExpense | null>(null);

  // Product Handlers (Scoped to Active Sheet)
  const handleAddProduct = (item: Omit<ProductExpense, 'id'>) => {
    const newEntry: ProductExpense = {
      ...item,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    updateSheetsState((prev) =>
      prev.map((s) =>
        s.id === activeSheet.id
          ? { ...s, products: [newEntry, ...s.products] }
          : s
      )
    );
  };

  const handleUpdateProduct = (updated: ProductExpense) => {
    updateSheetsState((prev) =>
      prev.map((s) =>
        s.id === activeSheet.id
          ? {
              ...s,
              products: s.products.map((p) => (p.id === updated.id ? updated : p)),
            }
          : s
      )
    );
    setEditingProduct(null);
  };

  const handleDuplicateProduct = (item: ProductExpense) => {
    const autoDT = getAutoDateTime();
    const duplicated: ProductExpense = {
      ...item,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productName: `${item.productName} (Copy)`,
      timestamp: autoDT.timestamp,
      date: autoDT.date,
      time: autoDT.time,
    };
    updateSheetsState((prev) =>
      prev.map((s) =>
        s.id === activeSheet.id
          ? { ...s, products: [duplicated, ...s.products] }
          : s
      )
    );
  };

  // Sheet Management Handlers
  const handleCreateSheet = (name: string) => {
    const newSheet: Sheet = {
      id: `sheet-${Date.now()}`,
      name,
      products: [],
      createdAt: new Date().toISOString(),
      budgetLimit: 40000,
    };
    updateSheetsState((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleRenameSheet = (id: string, newName: string) => {
    updateSheetsState((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleDuplicateSheet = (id: string) => {
    const target = sheets.find((s) => s.id === id);
    if (!target) return;
    const newSheet: Sheet = {
      id: `sheet-${Date.now()}`,
      name: `${target.name} (Copy)`,
      products: target.products.map((p) => ({
        ...p,
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      })),
      createdAt: new Date().toISOString(),
      budgetLimit: target.budgetLimit || 40000,
    };
    updateSheetsState((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleUpdateBudget = (sheetId: string, limit: number) => {
    updateSheetsState((prev) =>
      prev.map((s) => (s.id === sheetId ? { ...s, budgetLimit: limit } : s))
    );
  };

  const handleExportCSV = () => {
    exportProductsToCSV(currentProducts, activeSheet.name);
  };

  const activeSheetTotal = currentProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Clean Top Navigation */}
      <Navbar
        totalSpent={activeSheetTotal}
        totalCount={currentProducts.length}
        onOpenAddModal={() => {
          setEditingProduct(null);
          setIsModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        isSynced={isSynced}
      />

      {/* 2. Main Content Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-5 pb-20 sm:pb-8">
        {/* Multi-Sheet Manager Tabs */}
        <SheetTabs
          sheets={sheets}
          activeSheetId={activeSheet.id}
          onSelectSheet={setActiveSheetId}
          onCreateSheet={handleCreateSheet}
          onRenameSheet={handleRenameSheet}
          onDuplicateSheet={handleDuplicateSheet}
          onUpdateBudget={handleUpdateBudget}
        />

        {/* View Mode Content Switcher */}
        {viewMode === 'analytics' ? (
          <ExpenseAnalytics sheet={activeSheet} />
        ) : (
          <>
            {/* Statistics in Rupees (₹) for Active Sheet */}
            <ProductStats products={currentProducts} />

            {/* Product Log Table for Active Sheet */}
            <ProductLogTable
              products={currentProducts}
              activeSheetName={activeSheet.name}
              onAddProduct={handleAddProduct}
              onEditProduct={(product) => {
                setEditingProduct(product);
                setIsModalOpen(true);
              }}
              onDuplicateProduct={handleDuplicateProduct}
            />
          </>
        )}
      </main>

      {/* 3. Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => {
          setEditingProduct(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 sm:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xl active:scale-95 transition-all"
        aria-label="Add New Expense Entry"
      >
        <Plus className="w-5 h-5" />
        <span>Log Expense</span>
      </button>

      {/* 4. Product Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleAddProduct}
        onUpdate={handleUpdateProduct}
        initialProduct={editingProduct}
        sheetName={activeSheet.name}
      />

      {/* 5. Printable Hospital Audit Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sheet={activeSheet}
      />

      {/* 6. Minimalist Footer */}
      <footer className="border-t border-stone-300/60 dark:border-neutral-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>
          Eyevista Superspeciality Eye Hospital &bull; Department Expense Dashboard &bull; Live Shared Storage &bull; Currency: Indian Rupees (₹)
        </p>
      </footer>
    </div>
  );
}
