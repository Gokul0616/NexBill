import { useState } from 'react';
import {
    Bell, CheckCircle, FileText, AlertTriangle, CreditCard,
    RefreshCw, ArrowUpRight, Filter, Check, X, ChevronDown,
    Search, MoreHorizontal, Calendar, Download
} from 'lucide-react';

const ALL_NOTIFICATIONS = [
    {
        id: 1, type: 'success', category: 'Payments',
        title: 'Payment succeeded',
        detail: 'Jane Diaz paid $249.00 for Plan "Premium"',
        time: '17:31:11', date: 'May 16, 2026',
        amount: '$249.00', amountColor: '#1a9e4e',
        meta: 'pi_3P4kRz2eZvKYlo2C',
        unread: true,
        icon: CheckCircle,
    },
    {
        id: 2, type: 'info', category: 'Payments',
        title: 'Invoice #1048 paid',
        detail: 'Acme Corp settled invoice #1048 in full',
        time: '16:20:05', date: 'May 16, 2026',
        amount: '$1,200.00', amountColor: '#635bff',
        meta: 'in_1P3xRz2eZ',
        unread: true,
        icon: FileText,
    },
    {
        id: 3, type: 'warn', category: 'Disputes',
        title: 'Dispute opened',
        detail: 'A chargeback was filed on charge ch_3P4kRz2eZ. Respond before Jun 2.',
        time: '14:15:30', date: 'May 16, 2026',
        amount: 'Due Jun 2', amountColor: '#b45309',
        meta: 'dp_1Oz83mXzAB',
        unread: false,
        icon: AlertTriangle,
    },
    {
        id: 4, type: 'muted', category: 'Payouts',
        title: 'Payout initiated',
        detail: '$4,820.00 is on its way to your bank account',
        time: '09:05:12', date: 'May 15, 2026',
        amount: 'Arrives Jun 3', amountColor: '#697386',
        meta: 'po_1Pq84kRzJL',
        unread: false,
        icon: CreditCard,
    },
    {
        id: 5, type: 'info', category: 'Payments',
        title: 'New subscription',
        detail: 'Marcus Webb subscribed to Plan "Starter"',
        time: '18:45:00', date: 'May 14, 2026',
        amount: '$49.00', amountColor: '#635bff',
        meta: 'sub_1Pz84kRzJL',
        unread: false,
        icon: RefreshCw,
    },
    {
        id: 6, type: 'success', category: 'Payouts',
        title: 'Payout arrived',
        detail: '$3,210.00 was deposited into bank account ending in 4242',
        time: '11:20:15', date: 'May 14, 2026',
        amount: '$3,210.00', amountColor: '#1a9e4e',
        meta: 'po_1Nm72mXzAB',
        unread: false,
        icon: CheckCircle,
    },
];

const TABS = ['All', 'Payments', 'Disputes', 'Payouts'];

export default function Notifications() {
    const [activeTab, setActiveTab] = useState('All');
    const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = notifications.filter(n => {
        const matchesTab = activeTab === 'All' || n.category === activeTab;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.meta.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const markAllRead = () => setNotifications(prev =>
        prev.map(n => ({ ...n, unread: false }))
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                        <Bell size={12} />
                        Account Activity
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Events</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
                        <Download size={14} />
                        Export
                    </button>
                    <button 
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#635bff] hover:bg-[#5469d4] rounded-md transition-all cursor-pointer shadow-sm"
                    >
                        <Check size={14} />
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-[#0f0f10] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
                
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 dark:border-white/5 px-4 py-2 gap-4">
                    <div className="flex items-center gap-1">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all cursor-pointer
                                    ${activeTab === tab 
                                        ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' 
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                            type="text"
                            placeholder="Filter events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-[#635bff] transition-all"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-[140px_1fr_160px_120px] px-6 py-2.5 bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Event</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</span>
                </div>

                {/* List Body */}
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {filtered.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center opacity-40">
                            <Search size={40} className="mb-4 text-gray-300" />
                            <p className="text-[15px] font-medium">No results found</p>
                            <p className="text-[13px]">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        filtered.map(n => {
                            const Icon = n.icon;
                            return (
                                <div 
                                    key={n.id}
                                    className={`group grid grid-cols-1 lg:grid-cols-[140px_1fr_160px_120px] items-center px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer
                                        ${n.unread ? 'relative' : ''}
                                    `}
                                >
                                    {/* Unread dot */}
                                    {n.unread && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#635bff] rounded-full shadow-[0_0_8px_rgba(99,91,255,0.6)]" />
                                    )}

                                    {/* Date Column */}
                                    <div className="flex flex-col mb-2 lg:mb-0">
                                        <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-none">
                                            {n.date.split(',')[0]}
                                        </span>
                                        <span className="text-[11px] text-gray-400 mt-1 font-mono tracking-tighter">
                                            {n.time}
                                        </span>
                                    </div>

                                    {/* Event Column */}
                                    <div className="flex items-center gap-3 mb-2 lg:mb-0">
                                        <div className="w-8 h-8 rounded border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.03] flex items-center justify-center text-gray-400">
                                            <Icon size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13.5px] font-bold text-gray-900 dark:text-white truncate">
                                                {n.title}
                                            </p>
                                            <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                                                {n.detail}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ID Column */}
                                    <div className="hidden lg:block">
                                        <span className="text-[11px] font-mono text-gray-400 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-200/50 dark:border-white/5">
                                            {n.meta}
                                        </span>
                                    </div>

                                    {/* Amount Column */}
                                    <div className="flex items-center justify-between lg:justify-end gap-3">
                                        <span className="text-[13px] font-bold tabular-nums text-gray-900 dark:text-white" style={{ color: n.amountColor }}>
                                            {n.amount}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors text-gray-400">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[12px] text-gray-400 font-medium">
                        Showing {filtered.length} of {notifications.length} events
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-[12px] font-semibold text-gray-400 cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1 text-[12px] font-semibold text-[#635bff] hover:text-[#5469d4]">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}