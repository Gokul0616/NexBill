import { useContext, useState, useRef, useEffect } from 'react';
import {
    Search, Bell, HelpCircle, UserCircle, Megaphone,
    LogOut, User, Settings, Shield, FileText,
    CreditCard, AlertTriangle, CheckCircle, ChevronRight,
    ArrowRight, Globe, Monitor
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { useNavigate } from 'react-router-dom';
import NotificationDrawer from './NotificationDrawer';


const TABS = ['All', 'Payments', 'Disputes', 'Payouts'];

const notifications = [
    {
        id: 1,
        type: 'success',
        title: 'Payment succeeded',
        detail: 'from Jane Diaz',
        time: '2 min ago',
        amount: '$249.00',
        amountColor: '#635bff',
        unread: true,
        icon: <CheckCircle size={15} />,
    },
    {
        id: 2,
        type: 'info',
        title: 'Invoice #1048',
        detail: 'paid successfully',
        time: '1 hr ago',
        amount: '$1,200.00',
        amountColor: '#635bff',
        unread: true,
        icon: <FileText size={15} />,
    },
    {
        id: 3,
        type: 'warn',
        title: 'Dispute opened',
        detail: 'on ch_3P4kRz2eZ',
        time: '3 hr ago',
        amount: 'Respond by Jun 2',
        amountColor: '#b45309',
        unread: false,
        icon: <AlertTriangle size={15} />,
    },
    {
        id: 4,
        type: 'muted',
        title: 'Payout initiated',
        detail: 'of $4,820.00',
        time: 'Yesterday',
        amount: 'Arrives Jun 3',
        amountColor: '#697386',
        unread: false,
        icon: <CreditCard size={15} />,
    },
];

const iconStyles = {
    success: { bg: '#eafaf1', color: '#1a9e4e' },
    info: { bg: '#eef2ff', color: '#635bff' },
    warn: { bg: '#fff8e1', color: '#e6a817' },
    muted: { bg: '#f6f9fc', color: '#697386' },
};

function getInitials(user) {
    if (user?.name) return user.name.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'US';
}

export default function Header() {
    const { 
        user, logout, 
        verificationStatus, currentlyDue, verificationComments, refreshVerificationStatus 
    } = useContext(AuthContext);
    const { showMessage } = useMessage();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const notifRef = useRef(null);
    const userRef = useRef(null);
    const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
    const navigate = useNavigate();

    // Setup compliance notifications
    const complianceNotifications = [];
    if (verificationStatus === 'under_review') {
        complianceNotifications.push({
            id: 'compliance-review',
            type: 'warn',
            title: 'Account Verification',
            detail: 'under review',
            time: 'Just now',
            amount: 'Reviewing',
            amountColor: '#b45309',
            unread: true,
            icon: <AlertTriangle size={15} />,
            isCompliance: true,
            actionPath: '/activate'
        });
    } else if (verificationStatus === 'action_required' || verificationStatus === 'restricted') {
        complianceNotifications.push({
            id: 'compliance-action',
            type: 'warn',
            title: 'Action required',
            detail: 'verification rejected',
            time: 'Just now',
            amount: 'Resolve',
            amountColor: '#df1b41',
            unread: true,
            icon: <AlertTriangle size={15} />,
            isCompliance: true,
            actionPath: '/activate'
        });
    }

    const mergedNotifications = [...complianceNotifications, ...notifications];
    const filteredNotifications = activeTab === 'All' 
        ? mergedNotifications 
        : mergedNotifications.filter(n => n.category === activeTab);

    const unreadCount = mergedNotifications.filter(n => n.unread).length;

    const handleNotificationsClick = () => {
        setShowNotifs(false);
        setIsNotifDrawerOpen(true);
    }

    useEffect(() => {
        if (showNotifs) {
            refreshVerificationStatus();
        }
    }, [showNotifs]);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
            if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="flex items-center gap-4 h-[52px] px-6 flex-shrink-0 bg-white dark:bg-[#0d0d0d] border-b border-[#e3e8ee] dark:border-white/10">

            {/* ── Search ── */}
            <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-[15px] h-[15px] text-[#a3acb9] dark:text-gray-500 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-[13px] text-[#1a1f36] dark:text-white placeholder-[#a3acb9] dark:placeholder-gray-500 w-full"
                />
            </div>

            <div className="flex-1" />

            {/* ── Right side ── */}
            <div className="flex items-center gap-3">

                {/* Feedback */}
                <button className="flex items-center gap-1.5 text-[13px] text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer whitespace-nowrap">
                    <Megaphone className="w-[15px] h-[15px]" />
                    <span>Feedback?</span>
                </button>

                {/* ── Bell ── */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setShowNotifs(v => !v); setShowUser(false); }}
                        className="relative flex items-center justify-center text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer"
                        aria-label="Notifications"
                    >
                        <Bell className="w-[17px] h-[17px]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-[5px] -right-[6px] min-w-[14px] h-[14px] px-[3px] rounded-full bg-[#635bff] text-white text-[9px] font-bold leading-[14px] flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* ── Notification Dropdown ── */}
                    {showNotifs && (
                        <div className="absolute right-0 top-[calc(100%+10px)] w-[320px] bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-50 overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] dark:border-white/10">
                                <span className="text-[13px] font-semibold tracking-tight text-[#1a1f36] dark:text-white">
                                    Notifications
                                </span>
                                <button className="text-[12px] font-medium text-[#635bff] hover:text-[#4f46e5] cursor-pointer bg-none border-none">
                                    Mark all as read
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex px-4 border-b border-[#e3e8ee] dark:border-white/10">
                                {TABS.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-[12px] font-medium px-2.5 py-[9px] border-b-2 -mb-px cursor-pointer transition-colors
                                            ${activeTab === tab
                                                ? 'text-[#635bff] border-[#635bff]'
                                                : 'text-[#697386] dark:text-gray-400 border-transparent hover:text-[#3c4257] dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Items */}
                            <div>
                                {filteredNotifications.map(n => {
                                    const style = iconStyles[n.type];
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                if (n.isCompliance && n.actionPath) {
                                                    navigate(n.actionPath);
                                                    setShowNotifs(false);
                                                }
                                            }}
                                            className={`flex items-start gap-2.5 px-4 py-3 cursor-pointer transition-colors border-b border-[#f6f9fc] dark:border-white/5 last:border-none
                                                ${n.isCompliance 
                                                    ? (n.amountColor === '#df1b41' ? 'bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-100/50 dark:hover:bg-rose-950/20' : 'bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-100/50 dark:hover:bg-amber-950/20')
                                                    : (n.unread
                                                        ? 'bg-[#f7f6ff] dark:bg-[#635bff]/5 hover:bg-[#efedff] dark:hover:bg-[#635bff]/10'
                                                        : 'hover:bg-[#f6f9fc] dark:hover:bg-white/5'
                                                    )
                                                }`}
                                        >
                                            {/* Unread dot */}
                                            <span
                                                className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{ background: n.unread ? '#635bff' : 'transparent' }}
                                            />

                                            {/* Icon circle */}
                                            <div
                                                className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={n.isCompliance ? {
                                                    background: n.amountColor === '#df1b41' ? '#ffebee' : '#fff8e1',
                                                    color: n.amountColor
                                                } : {
                                                    background: style.bg,
                                                    color: style.color
                                                }}
                                            >
                                                {n.icon}
                                            </div>

                                            {/* Body */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] text-[#3c4257] dark:text-gray-200 leading-snug">
                                                    <span className="font-semibold">{n.title}</span>{' '}
                                                    <span className="text-[#697386] dark:text-gray-400 font-normal">{n.detail}</span>
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] text-[#a3acb9] dark:text-gray-500">{n.time}</span>
                                                    {n.amount && (
                                                        <>
                                                            <span className="text-[#a3acb9] text-[11px]">·</span>
                                                            <span className="text-[11px] font-medium" style={{ color: n.amountColor }}>
                                                                {n.amount}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2.5 border-t border-[#e3e8ee] dark:border-white/10 text-center">
                                <button onClick={() => handleNotificationsClick()} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#635bff] hover:text-[#4f46e5] cursor-pointer">
                                    View all notifications
                                    <ArrowRight size={11} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help */}
                <button
                    className="flex items-center justify-center text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer"
                    aria-label="Help"
                >
                    <HelpCircle className="w-[17px] h-[17px]" />
                </button>

                {/* ── User / Profile ── */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={() => { setShowUser(v => !v); setShowNotifs(false); }}
                        className="flex items-center justify-center text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors cursor-pointer"
                        aria-label="User menu"
                    >
                        <UserCircle className="w-[17px] h-[17px]" />
                    </button>

                    {/* ── Profile Dropdown ── */}
                    {showUser && (
                        <div className="absolute right-0 top-[calc(100%+10px)] w-[240px] bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] z-50">

                            {/* Account header */}
                            <div className="px-4 py-3 border-b border-[#e3e8ee] dark:border-white/10">
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)' }}>
                                        {getInitials(user)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-semibold tracking-tight text-[#1a1f36] dark:text-white truncate">
                                            {user?.name || user?.email?.split('@')[0] || 'User'}
                                        </p>
                                        <p className="text-[11px] text-[#a3acb9] dark:text-gray-500 truncate">
                                            {user?.email || 'Signed in'}
                                        </p>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-medium bg-[#eef2ff] text-[#635bff] px-2 py-0.5 rounded-full">
                                        Pro plan
                                    </span>
                                    <span className="text-[10px] font-medium bg-[#fff8e1] text-[#b45309] px-2 py-0.5 rounded-full">
                                        Test mode
                                    </span>
                                </div>
                            </div>

                            {/* Main menu items */}
                            <div className="py-1">
                                {[
                                    { icon: <User size={14} />, label: 'Profile', path: '/account?tab=profile' },
                                    {
                                        icon: <Settings size={14} />,
                                        label: 'Account settings',
                                        path: '/account',
                                        submenu: [
                                            { id: 'profile', label: 'Profile', icon: <User size={12} /> },
                                            { id: 'security', label: 'Security', icon: <Shield size={12} /> },
                                            { id: 'appearance', label: 'Appearance', icon: <Monitor size={12} /> },
                                            { id: 'notifications', label: 'Notifications', icon: <Bell size={12} /> },
                                        ]
                                    },
                                    { icon: <Bell size={14} />, label: 'Notification preferences', path: '/account?tab=notifications' },
                                ].map(item => (
                                    <div key={item.label} className="relative group/item">
                                        <button
                                            onClick={() => {
                                                navigate(item.path);
                                                setShowUser(false);
                                            }}
                                            className="flex items-center gap-2.5 w-full text-left px-4 py-[7px] text-[13px] text-[#3c4257] dark:text-gray-300 transition-colors hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer"
                                        >
                                            <span className="text-[#697386] dark:text-gray-500">{item.icon}</span>
                                            {item.label}
                                            {item.submenu && <ChevronRight size={12} className="ml-auto text-[#a3acb9]" />}
                                        </button>

                                        {/* Submenu */}
                                        {item.submenu && (
                                            <div className="absolute top-0 right-full mr-1 w-[180px] py-1 bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 translate-x-2 group-hover/item:translate-x-0">
                                                {item.submenu.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/account?tab=${sub.id}`);
                                                            setShowUser(false);
                                                        }}
                                                        className="flex items-center gap-2.5 w-full text-left px-3 py-[6px] text-[12px] text-[#3c4257] dark:text-gray-300 hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer transition-colors"
                                                    >
                                                        <span className="text-[#697386] dark:text-gray-500">{sub.icon}</span>
                                                        {sub.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Security + Help */}
                            <div className="border-t border-[#e3e8ee] dark:border-white/10 py-1">
                                <button
                                    onClick={() => { navigate('/account'); setShowUser(false); }}
                                    className="flex items-center gap-2.5 w-full text-left px-4 py-[7px] text-[13px] text-[#3c4257] dark:text-gray-300 transition-colors hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer"
                                >
                                    <span className="text-[#697386] dark:text-gray-500"><Shield size={14} /></span>
                                    Security
                                    <span className="ml-auto text-[10px] font-medium text-[#697386] bg-[#f6f9fc] dark:bg-white/10 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                        2FA on
                                    </span>
                                </button>
                                <button className="flex items-center gap-2.5 w-full text-left px-4 py-[7px] text-[13px] text-[#3c4257] dark:text-gray-300 transition-colors hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer">
                                    <span className="text-[#697386] dark:text-gray-500"><HelpCircle size={14} /></span>
                                    Help & support
                                </button>
                            </div>

                            {/* Switch account */}
                            <div className="border-t border-[#e3e8ee] dark:border-white/10 pb-1 pt-0.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#a3acb9] dark:text-gray-500 px-4 py-2">
                                    Switch account
                                </p>

                                {/* Active account */}
                                <div className="flex items-center gap-2 px-4 py-[7px] cursor-pointer hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-[#1a9e4e] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-medium text-[#3c4257] dark:text-gray-200 truncate">
                                            {user?.name || 'Main account'}
                                        </p>
                                        <p className="text-[10px] text-[#a3acb9] dark:text-gray-500">acct_1Pz84kRzJL</p>
                                    </div>
                                    <ChevronRight size={12} className="text-[#635bff]" />
                                </div>

                                {/* Second account */}
                                <div className="flex items-center gap-2 px-4 py-[7px] cursor-pointer hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-[#e3e8ee] dark:bg-white/20 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-medium text-[#3c4257] dark:text-gray-200 truncate">
                                            Sandbox
                                        </p>
                                        <p className="text-[10px] text-[#a3acb9] dark:text-gray-500">acct_1Rq72mXzAB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sign out */}
                            <div className="border-t border-[#e3e8ee] dark:border-white/10 py-1">
                                <button
                                    onClick={() => {
                                        logout();
                                        showMessage('Logged out successfully', 'info');
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-4 py-[7px] text-[13px] text-[#e5484d] transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                                >
                                    <LogOut size={14} />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <NotificationDrawer
                isOpen={isNotifDrawerOpen}
                onClose={() => setIsNotifDrawerOpen(false)}
            />
        </header>

    );
}