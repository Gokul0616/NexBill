import { NavLink } from 'react-router-dom';
import { 
  Search, Bell, LayoutDashboard, Users, CreditCard, Repeat, FileText, 
  Settings, Sun, Moon, Monitor, LogOut 
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className="w-[240px] bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-gray-800 h-screen flex flex-col fixed text-sm font-sans transition-colors duration-200">
      
      {/* Top Profile Section */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-lg cursor-pointer transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-200">
               <span className="text-xs">UB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight">NexBill</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Admin</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-7 pr-7 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-[13px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
            <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
              <span className="text-[9px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">⌘K</span>
            </div>
          </div>
          <button className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-5 pb-4 mt-2">
        <div className="space-y-0.5">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-2 py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium'}`}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => `flex items-center gap-3 px-2 py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium'}`}>
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/plans" className={({isActive}) => `flex items-center gap-3 px-2 py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium'}`}>
            <CreditCard className="w-4 h-4" />
            <span>Plans</span>
          </NavLink>
          <NavLink to="/subscriptions" className={({isActive}) => `flex items-center gap-3 px-2 py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium'}`}>
            <Repeat className="w-4 h-4" />
            <span>Subscriptions</span>
          </NavLink>
          <NavLink to="/invoices" className={({isActive}) => `flex items-center gap-3 px-2 py-1.5 text-[13px] rounded transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium'}`}>
            <FileText className="w-4 h-4" />
            <span>Invoices</span>
          </NavLink>
        </div>

        {/* Bottom Nav inside scrollable area to mimic image */}
        <div className="space-y-0.5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 w-full rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-medium">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-2 py-1.5 text-[13px] text-red-500 hover:text-red-600 dark:hover:text-red-400 w-full rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#111]">
        <div className="flex items-center gap-2 pl-1">
           <div className="w-5 h-5 bg-[#246dff] rounded-sm flex items-center justify-center">
             <span className="text-white font-bold text-[10px]">NB</span>
           </div>
           <span className="text-[13px] font-bold tracking-tight text-gray-900 dark:text-white">NexBill</span>
        </div>
        
        {/* Theme Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md border border-gray-200 dark:border-gray-700">
          <button onClick={() => setTheme('light')} className={`p-1 rounded ${theme === 'light' ? 'bg-white shadow-sm dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setTheme('dark')} className={`p-1 rounded ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setTheme('system')} className={`p-1 rounded ${theme === 'system' ? 'bg-white shadow-sm dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
