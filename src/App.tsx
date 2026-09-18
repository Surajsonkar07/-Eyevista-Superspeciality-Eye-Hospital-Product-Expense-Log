import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { ProductExpense, Sheet, User } from './types';
import { INITIAL_PRODUCTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { SheetTabs } from './components/SheetTabs';
import { ProductStats } from './components/ProductStats';
import { ProductLogTable } from './components/ProductLogTable';
import { ProductModal } from './components/ProductModal';
import { ExpenseAnalytics } from './components/ExpenseAnalytics';
import { PrintReportModal } from './components/PrintReportModal';
import { LoginPage } from './components/LoginPage';
import { UserManagementModal } from './components/UserManagementModal';
import { exportProductsToCSV, getAutoDateTime } from './utils/formatters';
import { fetchGlobalSheets, saveGlobalSheets } from './services/api';
import { StatsSkeleton, SheetTabsSkeleton, TableSkeleton } from './components/ui/Skeleton';

const DEFAULT_SHEETS: Sheet[] = [
  {
    id: 'sheet-1',
    name: 'Main OT & Consumables',
    products: [],
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

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('eyevista_current_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {  
      console.error(e);
    }
    return null;
  });

  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('eyevista_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('eyevista_current_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Multiple sheets state
  const [sheets, setSheets] = useState<Sheet[]>(DEFAULT_SHEETS);
  const [isSynced, setIsSynced] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
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

  // Lock refs to prevent polling collisions during local user actions (deleting, adding, editing)
  const isSavingRef = useRef(false);
  const lastLocalMutateTime = useRef<number>(0);

  // Initial Fetch & Polling for Cross-User Realtime Shared Storage Sync
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchGlobalSheets();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setSheets(data);
          setIsSynced(true);
        }
      } catch (err) {
        console.error('Initial data fetch error:', err);
      } finally {
        if (isMounted) {
          setTimeout(() => setIsLoadingData(false), 450);
        }
      }
    };

    loadData();

    // Poll every 3 seconds for live updates from other sessions
    const interval = setInterval(async () => {
      // Skip polling update if local user is actively mutating data or saved less than 4 seconds ago
      if (isSavingRef.current || Date.now() - lastLocalMutateTime.current < 4000) {
        return;
      }

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
  }, [currentUser]);

  // Save changes to API & local cache whenever sheets state mutates
  const updateSheetsState = (updater: (prev: Sheet[]) => Sheet[]) => {
    lastLocalMutateTime.current = Date.now();
    isSavingRef.current = true;

    setSheets((prev) => {
      const next = updater(prev);
      // Asynchronously persist to API and local storage
      Promise.resolve().then(async () => {
        await saveGlobalSheets(next);
        isSavingRef.current = false;
      });
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
    sheets.find((s) => s.id === activeSheetId) || sheets[0] || null;
  const currentProducts = activeSheet ? activeSheet.products : [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductExpense | null>(null);

  // Product Handlers (Scoped to Active Sheet)
  const handleAddProduct = (item: Omit<ProductExpense, 'id'>) => {
    if (!activeSheet) return;
    const newEntry: ProductExpense = {
      ...item,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      loggedBy: currentUser?.fullName || 'Staff User',
      loggedByUserId: currentUser?.id,
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
    if (!activeSheet) return;
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
    if (!activeSheet) return;
    const autoDT = getAutoDateTime();
    const duplicated: ProductExpense = {
      ...item,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productName: `${item.productName} (Copy)`,
      timestamp: autoDT.timestamp,
      date: autoDT.date,
      time: autoDT.time,
      loggedBy: currentUser?.fullName || item.loggedBy || 'Staff User',
    };
    updateSheetsState((prev) =>
      prev.map((s) =>
        s.id === activeSheet.id
          ? { ...s, products: [duplicated, ...s.products] }
          : s
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    if (!activeSheet) return;
    updateSheetsState((prev) =>
      prev.map((s) =>
        s.id === activeSheet.id
          ? {
              ...s,
              products: s.products.filter((p) => p.id !== productId),
            }
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
      assignedUserId: currentUser?.id,
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
        loggedBy: currentUser?.fullName || p.loggedBy || 'Staff User',
      })),
      createdAt: new Date().toISOString(),
      budgetLimit: target.budgetLimit || 40000,
    };
    updateSheetsState((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleDeleteSheet = (sheetId: string) => {
    const updatedSheets = sheets.filter((s) => s.id !== sheetId);
    if (activeSheetId === sheetId) {
      const nextActive = updatedSheets[0];
      setActiveSheetId(nextActive ? nextActive.id : '');
    }
    updateSheetsState(() => updatedSheets);
  };

  const handleUpdateBudget = (sheetId: string, limit: number) => {
    updateSheetsState((prev) =>
      prev.map((s) => (s.id === sheetId ? { ...s, budgetLimit: limit } : s))
    );
  };

  const handleExportCSV = () => {
    if (activeSheet) {
      exportProductsToCSV(currentProducts, activeSheet.name);
    }
  };

  // If user is not logged in, render LoginPage
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    );
  }

  const activeSheetTotal = currentProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-[#F1F5F9] transition-colors duration-200">
      {/* 1. Clean Top Navigation */}
      <Navbar
        totalSpent={activeSheetTotal}
        totalCount={currentProducts.length}
        onOpenAddModal={() => {
          if (!activeSheet) {
            handleCreateSheet('Main OT & Consumables');
          }
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
        currentUser={currentUser}
        onOpenUserManagement={() => setIsUserMgmtOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-5 pb-20 sm:pb-8">
        {isLoadingData ? (
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            <SheetTabsSkeleton />
            <StatsSkeleton />
            <TableSkeleton />
          </div>
        ) : (
          <>
            {/* Multi-Sheet Manager Tabs */}
            <SheetTabs
              sheets={sheets}
              activeSheetId={activeSheet ? activeSheet.id : ''}
              onSelectSheet={setActiveSheetId}
              onCreateSheet={handleCreateSheet}
              onRenameSheet={handleRenameSheet}
              onDuplicateSheet={handleDuplicateSheet}
              onDeleteSheet={handleDeleteSheet}
              onUpdateBudget={handleUpdateBudget}
            />

            {/* View Mode Content Switcher or Empty Sheet State */}
            {!activeSheet ? (
              <div className="bg-white dark:bg-[#111722] border border-stone-200/80 dark:border-[#202A3A] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-[#151D2A] text-blue-600 dark:text-[#4F7CFF] border border-transparent dark:border-[#202A3A] flex items-center justify-center">
                  <Plus className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-[#F1F5F9]">No Department Sheets Found</h3>
                  <p className="text-xs text-slate-500 dark:text-[#718096] max-w-md mx-auto">
                    All department sheets have been deleted. Click below to create a new expense tracking sheet for your hospital department.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateSheet('Main OT & Consumables')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#638DFF] active:scale-95 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Department Sheet</span>
                </button>
              </div>
            ) : viewMode === 'analytics' ? (
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
                  onDeleteProduct={handleDeleteProduct}
                />
              </>
            )}
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
        className="fixed bottom-5 right-5 z-40 sm:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-[#4F7CFF] hover:bg-[#638DFF] text-white font-semibold text-xs shadow-xl active:scale-95 transition-all"
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
        sheetName={activeSheet ? activeSheet.name : 'Department Sheet'}
      />

      {/* 5. Printable Hospital Audit Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sheet={activeSheet}
      />

      {/* 6. Admin User Management Modal */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        currentUser={currentUser}
      />

      {/* 7. Minimalist Footer */}
      <footer className="border-t border-stone-200/80 dark:border-[#202A3A] py-6 text-center text-xs text-slate-500 dark:text-[#718096]">
        <p>
          Eyevista Superspeciality Eye Hospital &bull; Department Expense Dashboard &bull; Logged in as: {currentUser.fullName} ({currentUser.role})
        </p>
      </footer>
    </div>
  );
}

