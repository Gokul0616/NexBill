import { useContext, useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, UserCircle, Megaphone, LogOut, User, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const { showMessage } = useMessage();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const notifRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
            if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const notifications = [
        { id: 1, text: 'New subscription from Jane Diaz', time: '2m ago', unread: true },
        { id: 2, text: 'Invoice #1048 was paid successfully', time: '1h ago', unread: true },
        { id: 3, text: 'Plan "Premium" updated', time: '3h ago', unread: false },
    ];

    return (
        /* ── Same background as page, no bottom border, no shadow ── */
        <header className="flex items-center gap-4 h-[52px] px-6 flex-shrink-0 bg-white dark:bg-[#0d0d0d] border-b border-[#e3e8ee] dark:border-white/10">

            {/* ── Search ── */}
            <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-[15px] h-[15px] text-[#a3acb9] dark:text-gray-500 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="
            bg-transparent border-none outline-none
            text-[13px] text-[#1a1f36] dark:text-white
            placeholder-[#a3acb9] dark:placeholder-gray-500
            w-full
          "
                />
            </div>

            {/* ── Spacer ── */}
            <div className="flex-1" />

            {/* ── Right side ── */}
            <div className="flex items-center gap-3">

                {/* Feedback */}
                <button className="flex items-center gap-1.5 text-[13px] text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                    <Megaphone className="w-[15px] h-[15px]" />
                    <span>Feedback?</span>
                </button>

                {/* Bell with badge */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setShowNotifs(v => !v); setShowUser(false); }}
                        className="relative flex items-center justify-center text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer"
                        aria-label="Notifications"
                    >
                        <Bell className="w-[17px] h-[17px]" />
                        {/* Red badge — filled circle with number */}
                        <span className="
              absolute -top-[5px] -right-[6px]
              min-w-[14px] h-[14px] px-[3px]
              rounded-full bg-[#e5484d]
              text-white text-[9px] font-bold leading-[14px]
              flex items-center justify-center
            ">
                            2
                        </span>
                    </button>

                    {/* Dropdown */}
                    {showNotifs && (
                        <div className="
              absolute right-0 top-[calc(100%+10px)] w-[300px]
              bg-white dark:bg-[#111]
              border border-[#e3e8ee] dark:border-white/10
              rounded-lg shadow-xl shadow-black/10 dark:shadow-black/40
              z-50 overflow-hidden
            ">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] dark:border-white/10">
                                <span className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">Notifications</span>
                                <button className="text-[12px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">Mark all read</button>
                            </div>
                            <div className="divide-y divide-[#f6f9fc] dark:divide-white/5">
                                {notifications.map(n => (
                                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer transition-colors">
                                        <span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.unread ? 'bg-[#5469d4]' : 'bg-transparent'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] text-[#3c4257] dark:text-gray-200 leading-snug">{n.text}</p>
                                            <p className="text-[11px] text-[#a3acb9] dark:text-gray-500 mt-0.5">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-[#e3e8ee] dark:border-white/10 text-center">
                                <button className="text-[12px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">View all</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help circle */}
                <button
                    className="flex items-center justify-center text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer"
                    aria-label="Help"
                >
                    <HelpCircle className="w-[17px] h-[17px]" />
                </button>

                {/* User circle */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={() => { setShowUser(v => !v); setShowNotifs(false); }}
                        className="flex items-center justify-center text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer"
                        aria-label="User menu"
                    >
                        <UserCircle className="w-[17px] h-[17px]" />
                    </button>

                    {/* User dropdown */}
                    {showUser && (
                        <div className="
              absolute right-0 top-[calc(100%+10px)] w-[200px]
              bg-white dark:bg-[#111]
              border border-[#e3e8ee] dark:border-white/10
              rounded-lg shadow-xl shadow-black/10 dark:shadow-black/40
              z-50 overflow-hidden
            ">
                            <div className="px-4 py-3 border-b border-[#e3e8ee] dark:border-white/10">
                                <p className="text-[13px] font-semibold text-[#1a1f36] dark:text-white truncate">
                                    {user?.name || user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-[11px] text-[#a3acb9] dark:text-gray-500 truncate mt-0.5">
                                    {user?.email || 'Signed in'}
                                </p>
                            </div>
                            
                            <div className="py-1">
                                <button className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] text-[#3c4257] dark:text-gray-300 transition-colors hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer">
                                    <User className="w-3.5 h-3.5 text-[#697386]" />
                                    Profile
                                </button>
                                <button className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] text-[#3c4257] dark:text-gray-300 transition-colors hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer">
                                    <Settings className="w-3.5 h-3.5 text-[#697386]" />
                                    Account settings
                                </button>
                                
                                <div className="border-t border-[#e3e8ee] dark:border-white/10 my-1" />
                                
                                <button 
                                    onClick={() => {
                                        logout();
                                        showMessage('Logged out successfully', 'info');
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-[13px] text-[#e5484d] transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}