import { NavLink } from 'react-router-dom';
import {
  Bell, LayoutDashboard, Users, CreditCard, Repeat, FileText,
  Settings, Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useMessage } from '../context/MessageContext';
import CustomTooltip from './CustomTooltip';

export default function Sidebar() {
  const { logout, user } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const { showMessage } = useMessage();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    showMessage('Logged out successfully', 'info');
  };

  const navLinkClass = (isActive) =>
    `flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] rounded transition-colors whitespace-nowrap w-full ${isActive
      ? 'text-gray-900 dark:text-white font-bold bg-white/80 dark:bg-[#222]'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-[#111] font-medium'
    }`;

  return (
    <div
      className={`
        relative z-[100]
        bg-white/60 dark:bg-black/40
        backdrop-blur-xl shadow-lg
        border-r border-white/50 dark:border-white/10
        h-screen flex flex-col flex-shrink-0
        text-sm font-sans
        transition-all duration-300
        ${isExpanded ? 'w-[240px]' : 'w-[56px]'}
      `}
    >
      {/* Top Profile Section */}
      <div className={`${isExpanded ? 'p-3' : 'p-2 flex flex-col items-center'}`}>
        <div className={`flex items-center ${isExpanded ? 'justify-between px-1.5' : 'justify-center'} mb-3 hover:bg-white/50 dark:hover:bg-white/5 py-1.5 rounded-lg cursor-pointer transition-all w-full`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 border border-white/50 dark:border-white/10 bg-gray-900 dark:bg-white flex items-center justify-center relative shadow-lg transition-colors">
              <span className="text-[14px] font-bold text-white dark:text-gray-900 uppercase leading-none">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            {isExpanded && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden min-w-0">
                <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
                  {user?.email || user?.sub || 'Signed in'}
                </span>
              </div>
            )}
          </div>
          {isExpanded && (
            <CustomTooltip text="Notifications" position="right">
              <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
                <Bell className="w-4 h-4" />
              </button>
            </CustomTooltip>
          )}
        </div>
      </div>

      {/* Nav Items — hidden scrollbar */}
      <div
        className={`flex-1 ${isExpanded ? 'px-3' : 'px-2'} space-y-5 pb-4 mt-2 overflow-y-auto`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Hides webkit scrollbar inline via a style tag trick — or add to global CSS */}

        <div className="space-y-0.5">
          <CustomTooltip text="Dashboard" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/" className={({ isActive }) => navLinkClass(isActive)}>
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Dashboard</span>}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Customers" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/customers" className={({ isActive }) => navLinkClass(isActive)}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Customers</span>}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Plans" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/plans" className={({ isActive }) => navLinkClass(isActive)}>
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Plans</span>}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Subscriptions" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/subscriptions" className={({ isActive }) => navLinkClass(isActive)}>
              <Repeat className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Subscriptions</span>}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Invoices" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/invoices" className={({ isActive }) => navLinkClass(isActive)}>
              <FileText className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Invoices</span>}
            </NavLink>
          </CustomTooltip>
        </div>

        {/* Bottom Nav */}
        <div className="space-y-0.5 pt-4 border-t border-white/20 dark:border-white/10">
          <CustomTooltip text="Settings" position="right" disabled={isExpanded} sidebar>
            <button className={`flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 w-full rounded hover:bg-white/50 dark:hover:bg-[#111] transition-colors font-medium cursor-pointer whitespace-nowrap`}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Settings</span>}
            </button>
          </CustomTooltip>

          <CustomTooltip text="Logout" position="right" disabled={isExpanded} sidebar>
            <button onClick={handleLogout} className={`flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] text-red-500 hover:text-red-600 dark:hover:text-red-400 w-full rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium cursor-pointer whitespace-nowrap`}>
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Logout</span>}
            </button>
          </CustomTooltip>
        </div>
      </div>

      {/* Brand Logo at Bottom */}
      <div className="pt-3 pb-0 border-t border-white/20 dark:border-white/10 flex flex-col items-center justify-center gap-3">
        {isExpanded && (
          <span className="text-[12px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase">
            NexBill
          </span>
        )}
        <div className={`transition-all duration-300 ${isExpanded ? 'w-12 h-12 rounded-sm' : 'w-8 h-8 rounded-sm'} overflow-hidden border border-white/50 dark:border-white/10 shadow-lg bg-white dark:bg-black/40 flex-shrink-0`}>
          <img src="/logo.png" alt="NexBill" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Footer: Theme Toggle + Collapse */}
      <div className={`p-3 border-t border-white/30 dark:border-white/10 flex items-center justify-between ${!isExpanded ? 'flex-col gap-3' : ''} bg-white/30 dark:bg-black/20`}>

        {/* Theme Toggle */}
        {!isExpanded ? (
          <CustomTooltip text={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} position="right" sidebar>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-md flex-shrink-0"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 flex-shrink-0 text-gray-400 hover:text-white" />
                : <Moon className="w-4 h-4 flex-shrink-0 text-gray-500 hover:text-gray-900" />}
            </button>
          </CustomTooltip>
        ) : (
          <div className="flex p-1 rounded-md border border-white/50 dark:border-[#333] shadow-md bg-white/60 dark:bg-[#1a1a1a]">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${theme === 'light' ? 'bg-white shadow-sm dark:bg-[#333] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <Sun className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded cursor-pointer transition-colors ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-[#333] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
              <Moon className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>
        )}

        {/* Collapse/Expand Toggle */}
        <CustomTooltip text={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'} position="right" sidebar>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer rounded-md hover:bg-white/50 dark:hover:bg-[#222] ${!isExpanded && 'bg-white/50 dark:bg-[#222]'}`}
          >
            {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </CustomTooltip>
      </div>
    </div>
  );
}