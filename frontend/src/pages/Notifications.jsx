import { useState } from 'react';
import {
    Bell, CheckCircle, FileText, AlertTriangle, CreditCard,
    RefreshCw, ArrowUpRight, Filter, Check, X, ChevronDown
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
        detail: 'Acme Corp settled invoice #1048 in full',
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
    {
        id: 6, type: 'success', category: 'Payouts',
        title: 'Payout arrived',
        detail: '$3,210.00 was deposited into your bank account ending in 4242',
        time: '3 days ago', date: 'Jun 10',
        amount: '$3,210.00', amountColor: '#1a9e4e',
        meta: 'po_1Nm72mXzAB',
        unread: false,
        icon: CheckCircle,
    },
    {
        id: 7, type: 'warn', category: 'Disputes',
        title: 'Dispute resolved — won',
        detail: 'The dispute on ch_3O9kRz2eZ was resolved in your favor',
        time: '5 days ago', date: 'Jun 8',
        amount: '$189.00 returned', amountColor: '#1a9e4e',
        meta: 'dp_1Nz83mXzAB',
        unread: false,
        icon: AlertTriangle,
    },
    {
        id: 8, type: 'muted', category: 'Payments',
        title: 'Payment failed',
        detail: 'Charge for Sofia Ramirez failed — card declined',
        time: '1 week ago', date: 'Jun 6',
        amount: '$99.00', amountColor: '#e5484d',
        meta: 'ch_3P1kRz2eZ',
        unread: false,
        icon: X,
    },
];

const TABS = ['All', 'Payments', 'Disputes', 'Payouts'];

const iconStyles = {
    success: { bg: '#eafaf1', color: '#1a9e4e', darkBg: '#0d2b1a' },
    info: { bg: '#eef2ff', color: '#635bff', darkBg: '#1a1640' },
    warn: { bg: '#fff8e1', color: '#e6a817', darkBg: '#2b200a' },
    muted: { bg: '#f6f9fc', color: '#697386', darkBg: '#1a1d20' },
};

function NotifRow({ n, onMarkRead }) {
    const style = iconStyles[n.type];
    const Icon = n.icon;

    return (
        <div className={`
                group flex items-start gap-4 px-6 py-4 cursor-pointer transition-all duration-150
                border-b border-[#f0f4f8] dark:border-white/[0.05] last:border-none
                ${n.unread
                ? 'bg-[#f7f6ff] dark:bg-[#635bff]/[0.05] hover:bg-[#efedff] dark:hover:bg-[#635bff]/[0.08]'
                : 'hover:bg-[#f6f9fc] dark:hover:bg-white/[0.03]'
            }
            `}>
            {/* Unread dot */}
            <div className="pt-[18px] flex-shrink-0">
                <span
                    className="block w-[7px] h-[7px] rounded-full transition-all"
                    style={{ background: n.unread ? '#635bff' : 'transparent' }}
                />
            </div>

            {/* Icon */}
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-[10px]"
                style={{ background: style.bg, color: style.color }}
            >
                <Icon size={16} strokeWidth={2} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-[10px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#1a1f36] dark:text-white leading-snug tracking-tight">
                            {n.title}
                        </p>
                        <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5 leading-relaxed">
                            {n.detail}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-[#a3acb9] dark:text-gray-500">{n.time}</span>
                            <span className="text-[#d0d5dd] dark:text-white/20 text-[11px]">·</span>
                            <span
                                className="text-[11px] font-medium font-mono"
                                style={{ color: style.color }}
                            >
                                {n.meta}
                            </span>
                        </div>
                    </div>

                    {/* Right: amount + actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span
                            className="text-[13px] font-semibold tabular-nums"
                            style={{ color: n.amountColor }}
                        >
                            {n.amount}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {n.unread && (
                                <button
                                    onClick={e => { e.stopPropagation(); onMarkRead(n.id); }}
                                    className="flex items-center gap-1 text-[11px] font-medium text-[#635bff] hover:text-[#4f46e5] px-2 py-0.5 rounded bg-[#eef2ff] hover:bg-[#e0e0ff] transition-colors"
                                >
                                    <Check size={10} />
                                    Mark read
                                </button>
                            )}
                            <button className="flex items-center gap-1 text-[11px] font-medium text-[#697386] hover:text-[#3c4257] px-2 py-0.5 rounded bg-[#f6f9fc] dark:bg-white/10 hover:bg-[#e3e8ee] dark:hover:bg-white/20 transition-colors">
                                <ArrowUpRight size={10} />
                                View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Notifications() {
    const [activeTab, setActiveTab] = useState('All');
    const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);

    const filtered = activeTab === 'All'
        ? notifications
        : notifications.filter(n => n.category === activeTab);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markRead = (id) => setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );

    const markAllRead = () => setNotifications(prev =>
        prev.map(n => ({ ...n, unread: false }))
    );

    // Group by date
    const grouped = filtered.reduce((acc, n) => {
        if (!acc[n.date]) acc[n.date] = [];
        acc[n.date].push(n);
        return acc;
    }, {});

    return (
        <div className="max-w-[760px] mx-auto">

            {/* ── Page heading ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[22px] font-semibold tracking-tight text-[#1a1f36] dark:text-white">
                        Notifications
                    </h1>
                    <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200 border border-[#e3e8ee] dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors bg-white dark:bg-white/5 hover:bg-[#f6f9fc] dark:hover:bg-white/10">
                        <Filter size={13} />
                        Filter
                        <ChevronDown size={12} />
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-[#635bff] hover:bg-[#4f46e5] px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Check size={13} />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* ── Card ── */}
            <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-xl overflow-hidden">

                {/* Tabs */}
                <div className="flex items-center border-b border-[#e3e8ee] dark:border-white/10 px-6">
                    {TABS.map(tab => {
                        const count = tab === 'All'
                            ? notifications.filter(n => n.unread).length
                            : notifications.filter(n => n.category === tab && n.unread).length;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                        relative flex items-center gap-1.5 text-[13px] font-medium px-1 py-3.5 mr-6 border-b-2 -mb-px transition-colors cursor-pointer
                                        ${activeTab === tab
                                        ? 'text-[#635bff] border-[#635bff]'
                                        : 'text-[#697386] dark:text-gray-400 border-transparent hover:text-[#3c4257] dark:hover:text-gray-200'
                                    }
                                    `}
                            >
                                {tab}
                                {count > 0 && (
                                    <span className={`
                                            text-[10px] font-bold px-1.5 py-px rounded-full leading-none
                                            ${activeTab === tab
                                            ? 'bg-[#635bff] text-white'
                                            : 'bg-[#e3e8ee] dark:bg-white/10 text-[#697386] dark:text-gray-400'
                                        }
                                        `}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Notification rows grouped by date */}
                {Object.keys(grouped).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f6f9fc] dark:bg-white/5 flex items-center justify-center">
                            <Bell size={18} className="text-[#a3acb9]" />
                        </div>
                        <p className="text-[13px] font-medium text-[#697386] dark:text-gray-400">
                            No notifications
                        </p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([date, items]) => (
                        <div key={date}>
                            {/* Date group header */}
                            <div className="px-6 py-2 bg-[#f6f9fc] dark:bg-white/[0.02] border-b border-[#f0f4f8] dark:border-white/[0.05]">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#a3acb9] dark:text-gray-500">
                                    {date}
                                </span>
                            </div>
                            {items.map(n => (
                                <NotifRow key={n.id} n={n} onMarkRead={markRead} />
                            ))}
                        </div>
                    ))
                )}

                {/* Footer */}
                {Object.keys(grouped).length > 0 && (
                    <div className="px-6 py-3.5 border-t border-[#e3e8ee] dark:border-white/10 flex items-center justify-between bg-[#f6f9fc]/50 dark:bg-white/[0.01]">
                        <span className="text-[12px] text-[#a3acb9] dark:text-gray-500">
                            Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                        </span>
                        <button className="text-[12px] font-medium text-[#635bff] hover:text-[#4f46e5] transition-colors">
                            Load more
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}