import React, { useState } from 'react';
import { Lock, User as UserIcon, ShieldAlert, ArrowRight, Activity, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  darkMode,
  onToggleDarkMode,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed. Please check network.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div
      className={`fixed inset-0 overflow-hidden flex flex-col justify-between transition-colors duration-200 select-none ${
        darkMode
          ? 'bg-[#0B0F17] text-[#F1F5F9]'
          : 'bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 text-slate-900'
      }`}
    >
      {/* 1. Header Bar with Eyevista Logo & Theme Toggle */}
      <header className={`w-full border-b backdrop-blur-md z-20 shrink-0 transition-colors ${
        darkMode ? 'bg-[#0D111A]/95 border-[#202A3A]' : 'bg-white/80 border-stone-200/90'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & Hospital Name */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 px-2 py-1 rounded-xl bg-white dark:bg-[#111722] border border-stone-200/80 dark:border-[#202A3A] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img
                src="/eyevista-logo.png"
                alt="Eyevista Superspeciality Eye Hospital Logo"
                className="h-7 w-auto max-w-[100px] object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://www.eyevistahospital.com/Photos/logo.png';
                }}
              />
            </div>
            <div>
              <span className={`text-sm sm:text-base font-extrabold font-display tracking-tight leading-tight block ${
                darkMode ? 'text-[#F1F5F9]' : 'text-slate-900'
              }`}>
                Eyevista
              </span>
              <p className={`text-[10px] sm:text-[11px] font-medium leading-tight truncate ${
                darkMode ? 'text-[#718096]' : 'text-slate-500'
              }`}>
                Superspeciality Eye Hospital
              </p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] border backdrop-blur-md shadow-xs transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#151D2A] border-[#202A3A] text-[#A7B2C4] hover:bg-[#202A3A] hover:text-[#F1F5F9]'
                : 'bg-white border-stone-300 text-slate-700 hover:bg-stone-50'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#F5B83D]" />
                <span className="text-xs font-semibold hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-semibold hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Extremely subtle ambient top glow (no large neon glow) */}
      <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-b from-[#4F7CFF]/[0.04] to-transparent pointer-events-none blur-3xl" />

      {/* 2. Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 relative z-10 overflow-y-auto no-scrollbar">
        <div className="max-w-md w-full relative">
          <div className="relative rounded-[18px] bg-white dark:bg-[#111722] border border-stone-200/90 dark:border-[#202A3A] p-6 sm:p-8 shadow-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)] space-y-5 transition-all overflow-hidden">
            {/* Header inside Card */}
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-[#1A2A4A] border border-blue-200/50 dark:border-[rgba(79,124,255,0.25)] text-blue-600 dark:text-[#4F7CFF] flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h2 className={`text-lg sm:text-xl font-bold font-display tracking-tight leading-tight block ${
                  darkMode ? 'text-[#F1F5F9]' : 'text-slate-900'
                }`}>
                  Sign In to Staff Portal
                </h2>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-[#718096]' : 'text-slate-500'}`}>
                  Authorized Eyevista hospital credentials required
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[#F15B6C] text-xs shadow-xs animate-shake relative z-10">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#F15B6C] mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-display ${
                  darkMode ? 'text-[#A7B2C4]' : 'text-slate-700'
                }`}>
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-[#718096]" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or nurse"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-medium transition-all border outline-none ${
                      darkMode
                        ? 'bg-[#0D131E] border-[#202A3A] hover:border-[#344158] text-[#F1F5F9] placeholder-[#718096] focus:border-[#4F7CFF] focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)]'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-display ${
                  darkMode ? 'text-[#A7B2C4]' : 'text-slate-700'
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-[#718096]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-10 pr-16 py-2.5 rounded-[9px] text-xs sm:text-sm font-medium transition-all border outline-none ${
                      darkMode
                        ? 'bg-[#0D131E] border-[#202A3A] hover:border-[#344158] text-[#F1F5F9] placeholder-[#718096] focus:border-[#4F7CFF] focus:shadow-[0_0_0_3px_rgba(79,124,255,0.10)]'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold cursor-pointer ${
                      darkMode ? 'text-[#718096] hover:text-[#F1F5F9]' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-[9px] bg-[#4F7CFF] hover:bg-[#638DFF] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-[0_2px_8px_rgba(79,124,255,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isLoading ? (
                  <span>Authenticating Securely...</span>
                ) : (
                  <>
                    <span>Sign In to Hospital Portal</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </form>

            {/* Admin Credentials Quick Hint */}
            <div className={`pt-3 border-t text-center space-y-2 relative z-10 ${
              darkMode ? 'border-[#202A3A]' : 'border-slate-200/80'
            }`}>
              <p className={`text-[11px] font-medium ${darkMode ? 'text-[#718096]' : 'text-slate-500'}`}>
                Hospital Admin Demo Credentials:
              </p>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[9px] border text-[11px] font-mono shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98 ${
                  darkMode
                    ? 'bg-[#151D2A] hover:bg-[#202A3A] border-[#202A3A] text-[#638DFF]'
                    : 'bg-blue-50/90 hover:bg-blue-100/90 border-blue-200 text-blue-800'
                }`}
              >
                <span>Username: <strong>admin</strong> | Pass: <strong>admin123</strong></span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="py-2.5 text-center text-[10px] sm:text-[11px] text-slate-500 dark:text-[#718096] z-10 shrink-0">
        Eyevista Superspeciality Eye Hospital &bull; Department Expense Log Portal
      </footer>
    </div>
  );
};
