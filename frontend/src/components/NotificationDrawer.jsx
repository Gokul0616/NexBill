import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Bell, CheckCircle, FileText, AlertTriangle, CreditCard,
    RefreshCw, ArrowRight, Settings, Check, X
} from 'lucide-react';

const ALL_NOTIFICATIONS = [
    {
        id: 1, type: 'success', category: 'Payments',
        title: 'Payment succeeded',
        detail: 'Jane Diaz paid $249.00 for Plan "Premium"',
        time: '2 min ago', date: 'Today',
        amount: '$249.00', amountColor: '#1a9e4e',
        meta: 'pi_3P4kRz2eZvKYlo2C',
        unread: true,
        icon: CheckCircle,
    },
    {
        id: 2, type: 'info', category: 'Payments',
        title: 'Invoice #1048 paid',
        detail: 'NexBill Inc settled invoice #1048 in full',
        time: '1 hr ago', date: 'Today',
        amount: '$1,200.00', amountColor: '#635bff',
        meta: 'in_1P3xRz2eZ',
        unread: true,
        icon: FileText,
    },
    {
        id: 3, type: 'warn', category: 'Disputes',
        title: 'Dispute opened',
        detail: 'A chargeback was filed on charge ch_3P4kRz2eZ. Respond before Jun 2.',
        time: '3 hr ago', date: 'Today',
        amount: 'Due Jun 2', amountColor: '#b45309',
        meta: 'dp_1Oz83mXzAB',
        unread: false,
        icon: AlertTriangle,
    },
    {
        id: 4, type: 'muted', category: 'Payouts',
        title: 'Payout initiated',
        detail: '$4,820.00 is on its way to your bank account',
        time: 'Yesterday', date: 'Yesterday',
        amount: 'Arrives Jun 3', amountColor: '#697386',
        meta: 'po_1Pq84kRzJL',
        unread: false,
        icon: CreditCard,
    },
    {
        id: 5, type: 'info', category: 'Payments',
        title: 'New subscription',
        detail: 'Marcus Webb subscribed to Plan "Starter" — recurring $49/mo',
        time: '2 days ago', date: 'Jun 11',
        amount: '$49.00', amountColor: '#635bff',
        meta: 'sub_1Pz84kRzJL',
        unread: false,
        icon: RefreshCw,
    },
];

const TABS = ['All', 'Payments', 'Disputes', 'Payouts'];

export default function NotificationDrawer({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);

    const { 
        verificationStatus, 
        currentlyDue, 
        verificationComments, 
        refreshVerificationStatus 
    } = useContext(AuthContext);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            refreshVerificationStatus();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    // Generate dynamic compliance notifications based on verification state
    const complianceNotifications = [];
    if (verificationStatus === 'under_review') {
        complianceNotifications.push({
            id: 'compliance-review',
            type: 'warn',
            category: 'Payouts',
            title: 'Account Verification Under Review',
            detail: 'Our compliance team is currently reviewing your merchant documents. Payouts and settlements are temporarily locked until review completes.',
            time: 'Just now',
            date: 'Today',
            amount: 'Reviewing',
            amountColor: '#b45309',
            meta: 'kyc_under_review',
            unread: true,
            icon: AlertTriangle,
            isCompliance: true,
            actionPath: '/activate'
        });
    } else if (verificationStatus === 'action_required' || verificationStatus === 'restricted') {
        const requiredLabel = currentlyDue.length > 0 
            ? `Required: ${currentlyDue.map(f => f.replace(/_/g, ' ')).join(', ')}` 
            : 'Document re-upload needed';
        complianceNotifications.push({
            id: 'compliance-action',
            type: 'error',
            category: 'Payouts',
            title: 'Verification Action Required',
            detail: `Compliance verification failed. ${requiredLabel}. Reason: ${verificationComments || 'Provided details are incomplete or invalid.'}`,
            time: 'Just now',
            date: 'Today',
            amount: 'Action Required',
            amountColor: '#df1b41',
            meta: 'kyc_rejected',
            unread: true,
            icon: AlertTriangle,
            isCompliance: true,
            actionPath: '/activate'
        });
    }

    const mergedNotifications = [...complianceNotifications, ...notifications];

    const filtered = activeTab === 'All'
        ? mergedNotifications
        : mergedNotifications.filter(n => n.category === activeTab);

    const markRead = (id) => {
        if (typeof id === 'string') return; // ignore read trigger for dynamic compliance warnings
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, unread: false } : n)
        );
    };

    const markAllRead = () => setNotifications(prev =>
        prev.map(n => ({ ...n, unread: false }))
    );

    const handleNotificationClick = (n) => {
        if (n.isCompliance && n.actionPath) {
            navigate(n.actionPath);
            onClose();
        } else {
            markRead(n.id);
        }
    };

    return createPortal(
        <div className={`fixed inset-0 z-[1000] flex justify-end overflow-hidden ${isOpen ? 'visible' : 'invisible'}`}>
            <style>{`
                @keyframes drawer-backdrop-fade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes drawer-slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .drawer-backdrop {
                    animation: drawer-backdrop-fade 0.2s ease-out forwards;
                }
                .drawer-content {
                    animation: drawer-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[4px] drawer-backdrop"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className="relative w-full max-w-[400px] bg-white dark:bg-[#0f0f10] shadow-2xl h-full flex flex-col drawer-content border-l border-gray-200 dark:border-white/10">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                    <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">Recent activity</h2>
                    <button
                        onClick={onClose}
                        className="text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Done
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 flex gap-4 border-b border-gray-100 dark:border-white/5">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-[13px] font-medium transition-all cursor-pointer relative
                                ${activeTab === tab
                                    ? 'text-[#635bff]'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#635bff] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                            <Bell size={32} className="text-gray-400 mb-4" strokeWidth={1.5} />
                            <p className="text-[13px] font-medium">No new activity</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {filtered.map(n => {
                                const Icon = n.icon;
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`px-6 py-4 flex gap-3 transition-colors cursor-pointer group hover:bg-gray-50/50 dark:hover:bg-white/[0.02]
                                            ${n.unread ? 'relative' : ''}
                                            ${n.isCompliance ? (n.type === 'error' ? 'bg-rose-50/30 dark:bg-rose-950/10 border-l-2 border-l-rose-500' : 'bg-amber-50/30 dark:bg-amber-950/10 border-l-2 border-l-amber-500') : ''}
                                        `}
                                    >
                                        {/* Unread indicator */}
                                        {n.unread && !n.isCompliance && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#635bff] rounded-full" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Icon size={14} className={n.isCompliance ? (n.type === 'error' ? 'text-rose-500' : 'text-amber-500') : 'text-gray-400'} />
                                                    <h4 className={`text-[13px] font-semibold truncate ${n.isCompliance ? (n.type === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400') : 'text-gray-900 dark:text-white'}`}>
                                                        {n.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[11px] text-gray-400 whitespace-nowrap mt-0.5">{n.time}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-normal">
                                                {n.detail}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[11px] font-bold tabular-nums`} style={{ color: n.amountColor }}>
                                                    {n.amount}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-tight bg-gray-50 dark:bg-white/5 px-1 rounded">
                                                    {n.meta}
                                                </span>
                                                {n.isCompliance && (
                                                    <span className="text-[10px] text-[#635bff] font-semibold underline ml-auto">
                                                        Resolve →
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inline Action */}
                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                            <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm">
                                                <ArrowRight size={14} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-3">
                    <button
                        onClick={markAllRead}
                        className="w-full py-2 bg-[#635bff] hover:bg-[#5469d4] text-white text-[13px] font-semibold rounded-md shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Check size={14} />
                        Mark all read
                    </button>
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => { navigate('/account'); onClose(); }}
                            className="text-[12px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Settings size={13} />
                            Settings
                        </button>

                        <button 
                            onClick={() => { navigate('/notifications'); onClose(); }}
                            className="text-[12px] font-medium text-[#635bff] hover:text-[#5469d4] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            Full history
                            <ArrowRight size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
