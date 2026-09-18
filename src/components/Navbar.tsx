import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Plus,
  Download,
  Printer,
  BarChart3,
  Table,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Check,
  Palette,
  FileText,
  Shield,
  User as UserIcon,
  Database,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface NavbarProps {
  totalSpent: number;
  totalCount: number;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onOpenPrintModal?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  viewMode?: 'table' | 'analytics';
  onToggleViewMode?: (mode: 'table' | 'analytics') => void;
  isSynced?: boolean;
  currentUser?: User | null;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onExportCSV,
  onOpenPrintModal,
  darkMode,
  onToggleDarkMode,
  viewMode = 'table',
  onToggleViewMode,
  isSynced = true,
  currentUser,
  onOpenUserManagement,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Dropdown states
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  // Submenu states
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const [isViewSubmenuOpen, setIsViewSubmenuOpen] = useState(false);

  // PWA install state
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Check standalone mode and listen for PWA install prompt
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
      });
    } else {
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIos) {
        setShowIosGuide(true);
      } else {
        alert("To install Eyevista app: tap your browser menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.");
      }
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
        setIsThemeSubmenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        setIsActionsMenuOpen(false);
        setIsViewSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = (currentUser?.fullName?.charAt(0) || currentUser?.username?.charAt(0) || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-200 bg-white/95 dark:bg-[#0D111A]/95 border-slate-200/80 dark:border-[#202A3A] shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* 1. Brand Logo & Hospital Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="h-9 sm:h-11 px-1.5 py-1 rounded-xl bg-white dark:bg-[#111722] border border-stone-200/80 dark:border-[#202A3A] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img
                src="/eyevista-logo.png"
                alt="Eyevista Superspeciality Eye Hospital Logo"
                className="h-7 sm:h-9 w-auto max-w-[85px] sm:max-w-[110px] object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://www.eyevistahospital.com/Photos/logo.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold font-display tracking-tight text-slate-900 dark:text-[#F1F5F9] leading-tight block">
                Eyevista
              </span>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-[#718096] tracking-tight leading-tight truncate hidden xs:block">
                Superspeciality Eye Hospital
              </p>
            </div>
          </div>

          {/* 2. Right Controls: View Switcher, Actions Menu, Submit, and Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* View Mode Toggle Segmented Control (Log vs Analytics) */}
            {onToggleViewMode && (
              <div className="hidden sm:flex items-center p-0.5 bg-stone-200/80 dark:bg-[#111722] rounded-xl border border-stone-300/80 dark:border-[#202A3A]">
                <button
                  type="button"
                  onClick={() => onToggleViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-[#1A2A4A] text-slate-900 dark:text-[#F1F5F9] dark:border dark:border-[#4F7CFF]/35 shadow-xs'
                      : 'text-slate-600 dark:text-[#718096] hover:text-slate-900 dark:hover:text-[#A7B2C4]'
                  }`}
                  title="Expense Log Table"
                >
                  <Table className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF]" />
                  <span>Log</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleViewMode('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'analytics'
                      ? 'bg-white dark:bg-[#1A2A4A] text-slate-900 dark:text-[#F1F5F9] dark:border dark:border-[#4F7CFF]/35 shadow-xs'
                      : 'text-slate-600 dark:text-[#718096] hover:text-slate-900 dark:hover:text-[#A7B2C4]'
                  }`}
                  title="Visual Analytics & Charts"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-[#638DFF]" />
                  <span>Analytics</span>
                </button>
              </div>
            )}

            {/* Actions & Reports Menu (Dropdown with Submenu) */}
            <div className="relative" ref={actionsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsActionsMenuOpen(!isActionsMenuOpen);
                  setIsProfileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isActionsMenuOpen
                    ? 'bg-stone-200/80 dark:bg-[#151D2A] border-stone-400 dark:border-[#344158] text-slate-900 dark:text-[#F1F5F9]'
                    : 'bg-white dark:bg-[#111722] border-stone-300/80 dark:border-[#202A3A] hover:bg-stone-100 dark:hover:bg-[#151D2A] dark:hover:border-[#344158] text-slate-700 dark:text-[#A7B2C4]'
                }`}
                aria-expanded={isActionsMenuOpen}
                aria-label="Actions & Reports Menu"
              >
                <FileText className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span className="hidden md:inline">Reports &amp; Tools</span>
                <span className="md:hidden">Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 dark:text-[#718096] transition-transform duration-200 ${
                    isActionsMenuOpen ? 'rotate-180 text-blue-600 dark:text-[#4F7CFF]' : ''
                  }`}
                />
              </button>

              {/* Actions Menu Dropdown */}
              <AnimatePresence>
                {isActionsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 4 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-1.5 w-64 rounded-2xl bg-white dark:bg-[#111722] border border-stone-200 dark:border-[#202A3A] shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)] p-1.5 space-y-1"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-stone-100 dark:border-[#202A3A]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#718096]">
                        Reports &amp; Export
                      </p>
                    </div>

                    {/* Print Official Report */}
                    {onOpenPrintModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenPrintModal();
                          setIsActionsMenuOpen(false);
                        }}
                        className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-[#151D2A] transition-all cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-[rgba(34,201,151,0.12)] text-emerald-600 dark:text-[#22C997] border border-transparent dark:border-[rgba(34,201,151,0.25)] flex items-center justify-center shrink-0 mt-0.5">
                          <Printer className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-[#4F7CFF]">
                            Print Official Report
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-[#718096]">
                            A4 letterhead expense breakdown
                          </p>
                        </div>
                      </button>
                    )}

                    {/* Export CSV */}
                    <button
                      type="button"
                      onClick={() => {
                        onExportCSV();
                        setIsActionsMenuOpen(false);
                      }}
                      className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-[#151D2A] transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[rgba(79,124,255,0.12)] text-blue-600 dark:text-[#4F7CFF] border border-transparent dark:border-[rgba(79,124,255,0.25)] flex items-center justify-center shrink-0 mt-0.5">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-[#4F7CFF]">
                          Export Spreadsheet (CSV)
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-[#718096]">
                          Download product logs &amp; amounts
                        </p>
                      </div>
                    </button>

                    {/* View Switcher Submenu (Mobile and Desktop) */}
                    {onToggleViewMode && (
                      <div className="pt-1 border-t border-stone-100 dark:border-[#202A3A]">
                        <button
                          type="button"
                          onClick={() => setIsViewSubmenuOpen(!isViewSubmenuOpen)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-[#151D2A] transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-[#718096]" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9]">
                              Dashboard View
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono font-medium text-blue-600 dark:text-[#4F7CFF] capitalize">
                              {viewMode}
                            </span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-slate-400 dark:text-[#718096] transition-transform duration-200 ${
                                isViewSubmenuOpen ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* View Submenu Options */}
                        <AnimatePresence>
                          {isViewSubmenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden pl-3 pr-1 py-1 space-y-1 bg-stone-50/70 dark:bg-[#0D131E] rounded-xl border border-stone-200/60 dark:border-[#202A3A]"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onToggleViewMode('table');
                                  setIsActionsMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                                  viewMode === 'table'
                                    ? 'text-blue-600 dark:text-[#4F7CFF] font-bold'
                                    : 'text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Table className="w-3.5 h-3.5" />
                                  <span>Log Table View</span>
                                </div>
                                {viewMode === 'table' && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onToggleViewMode('analytics');
                                  setIsActionsMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                                  viewMode === 'analytics'
                                    ? 'text-blue-600 dark:text-[#4F7CFF] font-bold'
                                    : 'text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="w-3.5 h-3.5" />
                                  <span>Analytics &amp; Charts</span>
                                </div>
                                {viewMode === 'analytics' && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Install Mobile App (PWA) Option */}
                    {!isInstalled && (
                      <div className="pt-1 border-t border-stone-100 dark:border-[#202A3A]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            handleInstallClick();
                          }}
                          className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-[#151D2A] transition-all cursor-pointer group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-[rgba(99,141,255,0.12)] text-indigo-600 dark:text-[#638DFF] border border-transparent dark:border-[rgba(99,141,255,0.25)] flex items-center justify-center shrink-0 mt-0.5">
                            <Smartphone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] group-hover:text-blue-600 dark:group-hover:text-[#4F7CFF] flex items-center gap-1.5">
                              <span>Install Mobile App</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold uppercase">
                                PWA
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-[#718096]">
                              Add to home screen on phone
                            </p>
                          </div>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Submit Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[9px] bg-[#4F7CFF] hover:bg-[#638DFF] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(79,124,255,0.25)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit</span>
            </button>

            {/* User Profile Menu & Submenus */}
            {currentUser && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsActionsMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isProfileMenuOpen
                      ? 'bg-stone-100 dark:bg-[#151D2A] border-stone-300 dark:border-[#344158]'
                      : 'bg-white dark:bg-[#111722] border-stone-200/90 dark:border-[#202A3A] hover:bg-stone-50 dark:hover:bg-[#151D2A] dark:hover:border-[#344158]'
                  }`}
                  aria-expanded={isProfileMenuOpen}
                  aria-label="User Profile and Settings Menu"
                >
                  {/* User Initial Avatar Badge */}
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-[#1A2A4A] text-blue-700 dark:text-[#4F7CFF] border border-blue-200 dark:border-[rgba(79,124,255,0.25)] flex items-center justify-center font-bold text-xs shrink-0">
                    {userInitial}
                  </div>

                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-[#F1F5F9] leading-tight truncate max-w-[100px]">
                      {currentUser.fullName || currentUser.username}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#718096] leading-tight capitalize">
                      {isAdmin ? '👑 Admin' : 'Staff'}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 dark:text-[#718096] transition-transform duration-200 ${
                      isProfileMenuOpen ? 'rotate-180 text-blue-600 dark:text-[#4F7CFF]' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Popover */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 4 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-1.5 w-72 rounded-2xl bg-white dark:bg-[#111722] border border-stone-200 dark:border-[#202A3A] shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)] p-2 space-y-1.5"
                      role="menu"
                    >
                      {/* User Info Header Card */}
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#0D131E] border border-stone-200/80 dark:border-[#202A3A] flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-[#1A2A4A] text-blue-700 dark:text-[#4F7CFF] border border-blue-200 dark:border-[rgba(79,124,255,0.25)] flex items-center justify-center font-bold text-sm shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] truncate font-display">
                              {currentUser.fullName}
                            </h4>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-semibold shrink-0 ${
                                isAdmin
                                  ? 'bg-amber-100 dark:bg-[rgba(245,184,61,0.12)] text-amber-700 dark:text-[#F5B83D] border border-amber-200 dark:border-[rgba(245,184,61,0.25)]'
                                  : 'bg-blue-100 dark:bg-[rgba(79,124,255,0.12)] text-blue-700 dark:text-[#638DFF] border border-blue-200 dark:border-[rgba(79,124,255,0.25)]'
                              }`}
                            >
                              {isAdmin ? 'Admin' : 'Staff'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-[#718096] truncate">
                            @{currentUser.username} &bull; {currentUser.department || 'Hospital'}
                          </p>
                        </div>
                      </div>

                      {/* Submenu: Appearance / Theme Selector */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setIsThemeSubmenuOpen(!isThemeSubmenuOpen)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-[#151D2A] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-[#4F7CFF]" />
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9]">
                                Appearance / Theme
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-[#718096]">
                                Current: {darkMode ? 'Dark Theme (Navy)' : 'Light Theme'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-slate-400 dark:text-[#718096] transition-transform duration-200 ${
                              isThemeSubmenuOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {/* Theme Submenu Items */}
                        <AnimatePresence>
                          {isThemeSubmenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden pl-3 pr-1 py-1 mt-1 space-y-1 bg-stone-50/70 dark:bg-[#0D131E] rounded-xl border border-stone-200/60 dark:border-[#202A3A]"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (darkMode) onToggleDarkMode();
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                                  !darkMode
                                    ? 'bg-white dark:bg-[#151D2A] text-blue-600 dark:text-[#4F7CFF] font-bold shadow-xs'
                                    : 'text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Light Mode</span>
                                </div>
                                {!darkMode && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF]" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!darkMode) onToggleDarkMode();
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                                  darkMode
                                    ? 'bg-white dark:bg-[#151D2A] text-blue-600 dark:text-[#4F7CFF] font-bold shadow-xs'
                                    : 'text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Dark Mode (Enterprise)</span>
                                </div>
                                {darkMode && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-[#4F7CFF]" />}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Admin User Management Option */}
                      {isAdmin && onOpenUserManagement && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenUserManagement();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-[#151D2A] transition-all cursor-pointer group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[rgba(245,184,61,0.12)] text-amber-600 dark:text-[#F5B83D] border border-transparent dark:border-[rgba(245,184,61,0.25)] flex items-center justify-center shrink-0">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] group-hover:text-amber-600 dark:group-hover:text-[#F5B83D]">
                              Manage Staff Users
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-[#718096]">
                              Add, edit, or remove hospital credentials
                            </p>
                          </div>
                        </button>
                      )}

                      {/* System Cloud Sync Status */}
                      <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#718096]">
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-slate-400 dark:text-[#718096]" />
                          <span>Storage Sync</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-[#22C997]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {isSynced ? 'Live Synced' : 'Offline'}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-stone-200/80 dark:border-[#202A3A] my-1" />

                      {/* Logout Action */}
                      {onLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-rose-600 dark:text-[#F15B6C] hover:bg-rose-50 dark:hover:bg-[rgba(241,91,108,0.12)] transition-all cursor-pointer font-semibold text-xs"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 dark:text-[#F15B6C]" />
                          <span>Sign Out of Portal</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* iOS PWA Installation Guide Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#151D2A] border border-stone-200 dark:border-[#202A3A] rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#1A2A4A] flex items-center justify-center text-blue-600 dark:text-[#4F7CFF] shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">
                  Install Eyevista on iPhone / iPad
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#718096]">
                  Use as a full-screen mobile app
                </p>
              </div>
            </div>

            <ol className="text-xs text-slate-700 dark:text-[#A7B2C4] space-y-2 list-decimal list-inside pl-1 bg-stone-50 dark:bg-[#0D131E] p-3 rounded-xl border border-stone-200/80 dark:border-[#202A3A]">
              <li>Open this page in <strong className="text-slate-900 dark:text-white">Safari</strong></li>
              <li>Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button at bottom (square with arrow ↑)</li>
              <li>Scroll down and tap <strong className="text-slate-900 dark:text-white">'Add to Home Screen'</strong></li>
              <li>Tap <strong className="text-blue-600 dark:text-[#4F7CFF]">'Add'</strong> in top-right corner</li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
