import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Languages,
  Award,
  LogOut,
  User as UserIcon,
  Bell,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onOpenProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenProfile }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const { handle, career, logout } = useAuth();

  const xp = career?.xp_points ?? 200;
  const level = career?.current_level ?? 1;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, job roles, roadmaps..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Gamified Level & XP Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-brand-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Lvl {level}</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">{xp} XP</span>
        </div>

        {/* Language Toggle (EN / HI) */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle Language (English / Hindi)"
        >
          <Languages className="w-4 h-4 text-brand-500" />
          <span className="font-bold">{lang.toUpperCase()}</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Mock Bell */}
        <button
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
        </button>

        {/* User Handle & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs">
              {handle ? handle.slice(1, 3).toUpperCase() : 'ME'}
            </div>
            <span className="hidden md:inline text-xs font-semibold font-mono text-slate-800 dark:text-slate-200">
              {handle || '@student'}
            </span>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
