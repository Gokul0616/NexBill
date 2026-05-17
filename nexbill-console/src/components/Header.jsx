import React, { useContext } from 'react';
import { RefreshCw, LogOut, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Header({ loading, onRefresh }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/50 backdrop-blur sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-black flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              NexBill Console
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700/50 font-mono">
                ADMIN WORKSPACE
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">KYC Verification & Account Activation Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Operator Profile Tag */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-full">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium max-w-[120px] truncate">{user.name || user.email}</span>
            </div>
          )}

          {/* Theme Adapter Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={onRefresh} 
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Merchant Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {user && (
            <button 
              onClick={logout} 
              className="p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-rose-500/10"
              title="Log Out Operator"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
