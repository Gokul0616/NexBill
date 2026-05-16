import { NavLink } from 'react-router-dom';
import {
  Bell, LayoutDashboard, Users, CreditCard, Repeat, FileText,
  Settings, Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen,
  ChevronDown, Code2, Link2, Package, BarChart2
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
  const [testData, setTestData] = useState(false);

  const handleLogout = () => {
    logout();
    showMessage('Logged out successfully', 'info');
  };

  // Top-level nav item with icon
  const iconNavClass = ({ isActive }) =>
    [
      'flex items-center w-full rounded-[5px] transition-all duration-200 text-[13.5px]',
      isExpanded ? 'gap-2.5 px-2 py-[5px]' : 'justify-center px-0 py-[7.5px]',
      isActive
        ? `text-[#5469d4] font-semibold ${!isExpanded ? 'bg-[#5469d4]/10 dark:bg-[#5469d4]/20 shadow-[inset_3px_0_0_#5469d4]' : ''}`
        : 'text-[#3c4257] dark:text-gray-300 font-normal hover:bg-[#f6f9fc] dark:hover:bg-white/5',
    ].join(' ');

  // Sub-item (indented, no icon) — expanded only
  const subNavClass = ({ isActive }) =>
    [
      'flex items-center w-full rounded-[5px] transition-colors duration-100 text-[13.5px]',
      'pl-[30px] pr-2 py-[4px]',
      isActive
        ? 'text-[#5469d4] font-semibold'
        : 'text-[#3c4257] dark:text-gray-400 font-normal hover:bg-[#f6f9fc] dark:hover:bg-white/5',
    ].join(' ');

  const getIconCls = (isActive) => 
    `w-[15.5px] h-[15.5px] flex-shrink-0 transition-colors ${isActive ? 'text-[#5469d4]' : 'text-[#697386] dark:text-gray-500'}`;

  return (
    <div
      className={[
        'relative z-[100] h-screen flex flex-col flex-shrink-0',
        'bg-white dark:bg-[#0d0d0d]',
        'border-r border-[#e3e8ee] dark:border-white/10',
        'transition-all duration-300',
        isExpanded ? 'w-[220px]' : 'w-[52px]',
      ].join(' ')}
    >
      {/* ── Logo / Workspace ── */}
      <div className={`flex-shrink-0 ${isExpanded ? 'px-4 pt-4 pb-3' : 'px-2 pt-4 pb-3 flex justify-center'}`}>
        <CustomTooltip text="NexBill" position="right" disabled={isExpanded} sidebar>
          <button className={[
            'flex items-center rounded-md transition-colors hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer',
            isExpanded ? 'gap-2 px-1 py-1 w-full' : 'p-1',
          ].join(' ')}>
            <div className="w-7 h-7 rounded-[6px] bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt=""
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-[13px] font-bold text-[#1a1f36] dark:text-white truncate">
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] text-[#697386] dark:text-gray-400 truncate">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            )}
            {isExpanded && <ChevronDown className="w-3.5 h-3.5 text-[#8792a2] flex-shrink-0 ml-1" />}
          </button>
        </CustomTooltip>
      </div>

      {/* ── Nav ── */}
      <div
        className={`flex-1 overflow-y-auto ${isExpanded ? 'px-3' : 'px-2'} pb-4`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Dashboard */}
        <CustomTooltip text="Dashboard" position="right" disabled={isExpanded} sidebar>
          <NavLink to="/" end className={iconNavClass}>
            {({ isActive }) => (
              <>
                <LayoutDashboard className={getIconCls(isActive)} />
                {isExpanded && <span>Dashboard</span>}
              </>
            )}
          </NavLink>
        </CustomTooltip>

        {/* ── Group 1: Customers & billing ── */}
        <div className="mt-4">
          <CustomTooltip text="Customers" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/customers" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <Users className={getIconCls(isActive)} />
                  {isExpanded && <span>Customers</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>

          {isExpanded && (
            <>
              <NavLink to="/subscriptions" className={subNavClass}>
                Subscriptions
              </NavLink>
              <NavLink to="/invoices" className={subNavClass}>
                Invoices
              </NavLink>
            </>
          )}

          {!isExpanded && (
            <>
              <CustomTooltip text="Subscriptions" position="right" sidebar>
                <NavLink to="/subscriptions" className={iconNavClass}>
                  {({ isActive }) => <Repeat className={getIconCls(isActive)} />}
                </NavLink>
              </CustomTooltip>
              <CustomTooltip text="Invoices" position="right" sidebar>
                <NavLink to="/invoices" className={iconNavClass}>
                  {({ isActive }) => <FileText className={getIconCls(isActive)} />}
                </NavLink>
              </CustomTooltip>
            </>
          )}
        </div>

        {/* ── Group 2 ── */}
        <div className="mt-4">
          <CustomTooltip text="Plans" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/plans" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <CreditCard className={getIconCls(isActive)} />
                  {isExpanded && <span>Plans</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Connected accounts" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/connected" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <Link2 className={getIconCls(isActive)} />
                  {isExpanded && <span>Connected accounts</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Products" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/products" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <Package className={getIconCls(isActive)} />
                  {isExpanded && <span>Products</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>

          <CustomTooltip text="Reports" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/reports" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <BarChart2 className={getIconCls(isActive)} />
                  {isExpanded && <span>Reports</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>
        </div>

        {/* ── Group 3: Dev ── */}
        <div className="mt-4">
          <CustomTooltip text="Developers" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/developers" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <Code2 className={getIconCls(isActive)} />
                  {isExpanded && <span>Developers</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>

          {/* View test data toggle */}
          {isExpanded ? (
            <button
              onClick={() => setTestData(v => !v)}
              className="flex items-center gap-2.5 px-2 py-[5px] w-full rounded-[5px] text-[13.5px] text-[#3c4257] dark:text-gray-300 hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span
                className={[
                  'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200',
                  testData ? 'bg-[#5469d4]' : 'bg-[#c1c9d2] dark:bg-[#444]',
                ].join(' ')}
                style={{ width: 28, height: 16 }}
              >
                <span
                  className="absolute top-[2px] w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ width: 12, height: 12, left: 2, transform: testData ? 'translateX(12px)' : 'translateX(0)' }}
                />
              </span>
              <span>View test data</span>
            </button>
          ) : (
            <CustomTooltip text="View test data" position="right" sidebar>
              <button
                onClick={() => setTestData(v => !v)}
                className="flex justify-center items-center w-full py-[7px] rounded-[5px] hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span
                  className={[
                    'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200',
                    testData ? 'bg-[#5469d4]' : 'bg-[#c1c9d2] dark:bg-[#444]',
                  ].join(' ')}
                  style={{ width: 24, height: 14 }}
                >
                  <span
                    className="absolute top-[2px] rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ width: 10, height: 10, left: 2, transform: testData ? 'translateX(10px)' : 'translateX(0)' }}
                  />
                </span>
              </button>
            </CustomTooltip>
          )}

          <CustomTooltip text="Settings" position="right" disabled={isExpanded} sidebar>
            <NavLink to="/settings" className={iconNavClass}>
              {({ isActive }) => (
                <>
                  <Settings className={getIconCls(isActive)} />
                  {isExpanded && <span>Settings</span>}
                </>
              )}
            </NavLink>
          </CustomTooltip>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={[
        'flex-shrink-0 border-t border-[#e3e8ee] dark:border-white/10 p-3',
        isExpanded ? 'flex items-center justify-between' : 'flex flex-col items-center gap-2',
      ].join(' ')}>
        {/* Theme toggle */}
        {isExpanded ? (
          <div className="flex p-0.5 rounded-md bg-[#f6f9fc] dark:bg-white/5 border border-[#e3e8ee] dark:border-white/10">
            <button
              onClick={() => setTheme('light')}
              className={[
                'p-1.5 rounded cursor-pointer transition-colors',
                theme === 'light'
                  ? 'bg-white dark:bg-[#222] shadow-sm text-[#1a1f36] dark:text-white'
                  : 'text-[#8792a2] hover:text-[#3c4257] dark:hover:text-gray-200',
              ].join(' ')}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={[
                'p-1.5 rounded cursor-pointer transition-colors',
                theme === 'dark'
                  ? 'bg-white dark:bg-[#222] shadow-sm text-[#1a1f36] dark:text-white'
                  : 'text-[#8792a2] hover:text-[#3c4257] dark:hover:text-gray-200',
              ].join(' ')}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <CustomTooltip text={theme === 'dark' ? 'Light mode' : 'Dark mode'} position="right" sidebar>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 cursor-pointer rounded-md text-[#697386] hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </CustomTooltip>
        )}

        {/* Collapse */}
        <CustomTooltip text={isExpanded ? 'Collapse' : 'Expand'} position="right" sidebar>
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="p-1.5 text-[#697386] hover:text-[#3c4257] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          >
            {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </CustomTooltip>
      </div>
    </div>
  );
}