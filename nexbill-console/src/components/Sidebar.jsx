import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  LayoutDashboard, LogOut, Sun, Moon, Monitor, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
  ];

  return (
    <aside className={`h-screen sticky top-0 flex flex-col border-r transition-all duration-300 z-50
      bg-white dark:bg-[#0f1117] border-zinc-200 dark:border-[#1e1f2a]
      ${collapsed ? 'w-[68px]' : 'w-[220px]'}`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-zinc-200 dark:border-[#1e1f2a] ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-[#2a2b3a] flex-shrink-0">
          <img src="/logo.png" alt="NexBill" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-[14px] font-bold text-zinc-900 dark:text-white tracking-tight truncate">NexBill</h1>
            <p className="text-[10px] text-zinc-400 dark:text-[#4a4d63] font-mono uppercase tracking-wider">Console</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                item.active
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20'
                  : 'text-zinc-400 dark:text-[#64667a] hover:text-zinc-700 dark:hover:text-[#a0a2b8] hover:bg-zinc-50 dark:hover:bg-[#161722]'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="px-3 pb-4 space-y-2 border-t border-zinc-200 dark:border-[#1e1f2a] pt-3">
        <button
          onClick={cycleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] text-zinc-400 dark:text-[#64667a] hover:text-zinc-700 dark:hover:text-[#a0a2b8] hover:bg-zinc-50 dark:hover:bg-[#161722] transition-all cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-[16px] h-[16px] flex-shrink-0" />
          {!collapsed && <span className="capitalize truncate">{theme} Mode</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] text-zinc-400 dark:text-[#64667a] hover:text-zinc-700 dark:hover:text-[#a0a2b8] hover:bg-zinc-50 dark:hover:bg-[#161722] transition-all cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-[16px] h-[16px]" /> : <ChevronLeft className="w-[16px] h-[16px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {user && (
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-[#13141e] border border-zinc-200 dark:border-[#1e1f2a] ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] text-white font-bold flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-zinc-800 dark:text-[#d1d5db] truncate">{user.name || 'Operator'}</p>
                <p className="text-[10px] text-zinc-400 dark:text-[#4a4d63] truncate">{user.email}</p>
              </div>
            )}
            <button onClick={logout} className="p-1.5 rounded-md text-zinc-400 dark:text-[#4a4d63] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
