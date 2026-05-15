import { NavLink } from 'react-router-dom';
import {
  Search, Bell, LayoutDashboard, Users, CreditCard, Repeat, FileText,
  Settings, Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import CustomTooltip from './CustomTooltip';

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`relative z-[100] bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-lg border-r border-white/50 dark:border-white/10 h-screen flex flex-col flex-shrink-0 text-sm font-sans transition-all duration-300 ${isExpanded ? 'w-[240px]' : 'w-[80px]'}`}>

      {/* Top Profile Section */}
      <div className={`p-3 ${!isExpanded && 'flex flex-col items-center'}`}>
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-3 hover:bg-white/50 dark:hover:bg-white/5 p-1.5 rounded-lg cursor-pointer transition-colors w-full`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden flex-shrink-0 border border-blue-200">
              <span className="text-xs">UB</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight">NexBill</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className={`flex items-center gap-2 w-full ${!isExpanded && 'justify-center'}`}>
          {isExpanded ? (
            <div className="relative flex-1 transition-all overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-7 pr-7 py-1.5 border border-white/50 dark:border-[#333] rounded-md text-[13px] bg-white/50 dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
                <span className="text-[9px] font-bold text-gray-500 bg-white/80 dark:bg-[#222] px-1 py-0.5 rounded border border-gray-200 dark:border-[#444]">⌘K</span>
              </div>
            </div>
          ) : (
            <CustomTooltip text="Search" position="right">
              <button className="p-1.5 border border-white/50 dark:border-[#333] rounded-md text-gray-500 bg-white/50 dark:bg-[#111] hover:bg-white/80 dark:hover:bg-gray-800 transition-colors shadow-sm cursor-pointer flex-shrink-0">
                <Search className="w-4 h-4" />
              </button>
            </CustomTooltip>
          )}
          
          {isExpanded && (
            <button className="p-1.5 border border-white/50 dark:border-[#333] rounded-md text-gray-500 bg-white/50 dark:bg-[#111] hover:bg-white/80 dark:hover:bg-gray-800 transition-colors flex-shrink-0 shadow-sm cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className={`flex-1 ${isExpanded ? 'px-3' : 'px-2'} space-y-5 pb-4 mt-2`}>
        <div className="space-y-0.5">
          <CustomTooltip text="Dashboard" position="right" disabled={isExpanded}>
            <NavLink to="/" className={({ isActive }) => `flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-white/80 dark:bg-[#222]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-[#111] font-medium'} whitespace-nowrap overflow-hidden`}>
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Dashboard</span>}
            </NavLink>
          </CustomTooltip>
          <CustomTooltip text="Customers" position="right" disabled={isExpanded}>
            <NavLink to="/customers" className={({ isActive }) => `flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-white/80 dark:bg-[#222]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-[#111] font-medium'} whitespace-nowrap overflow-hidden`}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Customers</span>}
            </NavLink>
          </CustomTooltip>
          <CustomTooltip text="Plans" position="right" disabled={isExpanded}>
            <NavLink to="/plans" className={({ isActive }) => `flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-white/80 dark:bg-[#222]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-[#111] font-medium'} whitespace-nowrap overflow-hidden`}>
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Plans</span>}
            </NavLink>
          </CustomTooltip>
          <CustomTooltip text="Subscriptions" position="right" disabled={isExpanded}>
            <NavLink to="/subscriptions" className={({ isActive }) => `flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-white/80 dark:bg-[#222]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-[#111] font-medium'} whitespace-nowrap overflow-hidden`}>
              <Repeat className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Subscriptions</span>}
            </NavLink>
          </CustomTooltip>
          <CustomTooltip text="Invoices" position="right" disabled={isExpanded}>
            <NavLink to="/invoices" className={({ isActive }) => `flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-white/80 dark:bg-[#222]' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-[#111] font-medium'} whitespace-nowrap overflow-hidden`}>
              <FileText className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Invoices</span>}
            </NavLink>
          </CustomTooltip>
        </div>

        {/* Bottom Nav */}
        <div className="space-y-0.5 pt-4 border-t border-white/20 dark:border-white/10">
          <CustomTooltip text="Settings" position="right" disabled={isExpanded}>
            <button className={`flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 w-full rounded hover:bg-white/50 dark:hover:bg-[#111] transition-colors font-medium cursor-pointer whitespace-nowrap overflow-hidden`}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Settings</span>}
            </button>
          </CustomTooltip>
          <CustomTooltip text="Logout" position="right" disabled={isExpanded}>
            <button onClick={logout} className={`flex items-center ${isExpanded ? 'gap-3 px-2' : 'justify-center'} py-1.5 text-[13px] text-red-500 hover:text-red-600 dark:hover:text-red-400 w-full rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium cursor-pointer whitespace-nowrap overflow-hidden`}>
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>Logout</span>}
            </button>
          </CustomTooltip>
        </div>
      </div>

      <div className={`p-3 border-t border-white/30 dark:border-white/10 flex items-center justify-between ${!isExpanded ? 'flex-col gap-3' : ''} bg-white/30 dark:bg-black/20`}>
        
        {/* Theme Toggle */}
        {!isExpanded ? (
          <CustomTooltip text={theme === 'dark' ? "Light Mode" : "Dark Mode"} position="right">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-md flex-shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 flex-shrink-0 text-gray-400 hover:text-white" /> : <Moon className="w-4 h-4 flex-shrink-0 text-gray-500 hover:text-gray-900" />}
            </button>
          </CustomTooltip>
        ) : (
          <div className="flex p-1 rounded-md border border-white/50 dark:border-[#333] shadow-md bg-white/60 dark:bg-[#1a1a1a]">
            <CustomTooltip text="Light Mode" position="right" disabled={isExpanded}>
              <button onClick={() => setTheme('light')} className={`p-1.5 rounded cursor-pointer transition-colors ${theme === 'light' ? 'bg-white shadow-sm dark:bg-[#333] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                <Sun className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </CustomTooltip>
            <CustomTooltip text="Dark Mode" position="right" disabled={isExpanded}>
              <button onClick={() => setTheme('dark')} className={`p-1.5 rounded cursor-pointer transition-colors ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-[#333] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                <Moon className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </CustomTooltip>
          </div>
        )}

        {/* Collapse/Expand Toggle */}
        <CustomTooltip text={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"} position="right">
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
