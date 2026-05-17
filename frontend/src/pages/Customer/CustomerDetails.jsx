import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';
import { useMessage } from '../../context/MessageContext';
import LoadingScreen from '../../components/LoadingScreen';
import { getCustomerFields } from '../../lib/customerFields';
import {
    ArrowLeft, ChevronDown, Pencil, X, MoreHorizontal,
    ChevronRight
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

const statusCls = {
    Succeeded: 'bg-[#d4edda] text-[#1a6430] dark:bg-green-900/30 dark:text-green-400',
    Refunded: 'bg-[#fff3cd] text-[#856404] dark:bg-yellow-900/30 dark:text-yellow-400',
    Failed: 'bg-[#f8d7da] text-[#721c24] dark:bg-red-900/30 dark:text-red-400',
    Active: 'bg-[#d4edda] text-[#1a6430] dark:bg-green-900/30 dark:text-green-400',
};

// Mock payments for detail view
const mockPayments = [
    { amount: '$9.93', currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 14, 11:14 PM' },
    { amount: '$2.00', currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 14, 1:06 AM' },
    { amount: '$2.00', currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 13, 1:05 AM' },
    { amount: '$2.00', currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 12, 1:03 AM' },
    { amount: '$2.00', currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 11, 1:03 AM' },
];

// ── Customer Detail Panel ─────────────────────────────────────────────────────
export default function CustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showMessage } = useMessage();
    const [customer, setCustomer] = useState(null);
    const [tab, setTab] = useState('overview');
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [customFields, setCustomFields] = useState([]);

    useEffect(() => {
        setCustomFields(getCustomerFields().filter(f => f.isCustom && f.enabled));
        
        const fetchCustomer = async () => {
            try {
                const res = await apiClient.get(`/customers/${id}`);
                setCustomer(res.data);
            } catch (err) {
                showMessage('Failed to fetch customer details', 'error');
                navigate('/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id, navigate, showMessage]);

    if (loading) return <LoadingScreen text="Fetching customer details..." />;
    if (!customer) return null;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">

            {/* Back breadcrumb */}
            <button onClick={() => navigate('/customers')}
                className="flex items-center gap-1.5 text-[13px] text-[#5469d4] hover:text-[#4a5fc1] mb-4 transition-colors cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Customers
            </button>

            {/* ── Two-column layout ── */}
            <div className="flex gap-6 items-start">

                {/* ── LEFT PANEL ── */}
                <div className="w-[260px] flex-shrink-0 space-y-4">

                    {/* Name + email */}
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1a1f36] dark:text-white tracking-tight">{customer.name}</h1>
                        <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">{customer.email}</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Spent', value: '$635.93' },
                            { label: 'Since', value: fmt(customer.created_at) },
                            { label: 'MRR', value: '$9.99' },
                        ].map(s => (
                            <div key={s.label}>
                                <p className="text-[11px] text-[#8792a2] dark:text-gray-500 font-medium">{s.label}</p>
                                <p className="text-[13px] font-semibold text-[#1a1f36] dark:text-white mt-0.5 flex items-center gap-0.5">
                                    {s.value}
                                    {s.label === 'MRR' && <ChevronDown className="w-3 h-3 text-[#8792a2]" />}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Details section */}
                    <div className="border-t border-[#e3e8ee] dark:border-white/10 pt-3">
                        <button
                            onClick={() => setDetailsOpen(v => !v)}
                            className="flex items-center justify-between w-full text-[13px] font-semibold text-[#1a1f36] dark:text-white mb-2 hover:text-[#5469d4] transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-1">
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${detailsOpen ? '' : '-rotate-90'}`} />
                                Details
                            </span>
                            <span className="text-[12px] text-[#5469d4] font-medium">Edit</span>
                        </button>

                        {detailsOpen && (
                            <div className="space-y-3">
                                {/* Customer ID */}
                                <div className="bg-[#f6f9fc] dark:bg-white/5 border border-[#e3e8ee] dark:border-white/10 rounded px-2.5 py-1.5 font-mono text-[11px] text-[#697386] dark:text-gray-400 truncate">
                                    {customer.id}
                                </div>

                                {/* Account details */}
                                <div>
                                    <p className="text-[11px] text-[#8792a2] dark:text-gray-500 font-medium mb-0.5">Account details</p>
                                    <p className="text-[13px] text-[#3c4257] dark:text-gray-200">{customer.name}</p>
                                    <p className="text-[13px] text-[#3c4257] dark:text-gray-200">{customer.email}</p>
                                </div>

                                {/* Phone */}
                                {customer.phone && (
                                    <div>
                                        <p className="text-[11px] text-[#8792a2] dark:text-gray-500 font-medium mb-0.5">Phone</p>
                                        <p className="text-[13px] text-[#3c4257] dark:text-gray-200">{customer.phone}</p>
                                    </div>
                                )}

                                {/* Billing emails */}
                                <div>
                                    <p className="text-[11px] text-[#8792a2] dark:text-gray-500 font-medium mb-0.5">Billing emails</p>
                                    <p className="text-[13px] text-[#3c4257] dark:text-gray-200">{customer.email}</p>
                                </div>

                                {/* GST */}
                                {customer.gst_number && (
                                    <div>
                                        <p className="text-[11px] text-[#8792a2] dark:text-gray-500 font-medium mb-0.5">GST Number</p>
                                        <p className="text-[13px] text-[#3c4257] dark:text-gray-200 font-mono">{customer.gst_number}</p>
                                    </div>
                                )}

                                {/* Custom Fields */}
                                {customFields.map(f => customer[f.key] && (
                                    <div key={f.key}>
                                        <p className="text-[11px] text-[#8792a2] dark:text-gray-500 font-medium mb-0.5">{f.label}</p>
                                        <p className="text-[13px] text-[#3c4257] dark:text-gray-200">{customer[f.key]}</p>
                                    </div>
                                ))}

                                <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium transition-colors cursor-pointer">
                                    Show more
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="border-t border-[#e3e8ee] dark:border-white/10 pt-3">
                        <button className="flex items-center gap-1 text-[13px] font-semibold text-[#1a1f36] dark:text-white hover:text-[#5469d4] transition-colors cursor-pointer">
                            <ChevronRight className="w-3.5 h-3.5" /> Metadata
                        </button>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="flex-1 min-w-0">

                    {/* Tabs + Actions */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-0 border-b border-[#e3e8ee] dark:border-white/10 w-full">
                            {['overview', 'events'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`px-4 py-2 text-[13px] font-medium capitalize transition-colors border-b-2 -mb-px cursor-pointer ${tab === t
                                        ? 'border-[#5469d4] text-[#5469d4]'
                                        : 'border-transparent text-[#697386] dark:text-gray-400 hover:text-[#3c4257] dark:hover:text-gray-200'
                                        }`}
                                >
                                    {t === 'overview' ? 'Overview' : 'Events and logs'}
                                </button>
                            ))}
                            <div className="flex-1" />
                            <button className="flex items-center gap-1 mb-1 px-3 py-1.5 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-medium rounded-md transition-colors cursor-pointer">
                                Actions <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {tab === 'overview' && (
                        <div className="space-y-6">

                            {/* Subscriptions */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-[15px] font-semibold text-[#1a1f36] dark:text-white">Subscriptions</h2>
                                    <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">Create</button>
                                </div>
                                <div className="border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f9fc] dark:hover:bg-white/5 cursor-pointer transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-[#1a9c6a]/10 flex items-center justify-center flex-shrink-0">
                                            <div className="w-4 h-4 rounded-full bg-[#1a9c6a]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">Premium Plan</span>
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#d4edda] text-[#1a6430] dark:bg-green-900/30 dark:text-green-400">Active</span>
                                            </div>
                                            <p className="text-[12px] text-[#697386] dark:text-gray-400 mt-0.5">Billing monthly · Next invoice on Oct 14 for $9.99</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button className="p-1.5 text-[#697386] hover:text-[#3c4257] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-white/10 rounded transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 text-[#697386] hover:text-[#3c4257] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-white/10 rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 text-[#697386] hover:text-[#3c4257] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-white/10 rounded transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Payments */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-[15px] font-semibold text-[#1a1f36] dark:text-white">Payments</h2>
                                    <div className="flex items-center gap-3">
                                        <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">View all</button>
                                        <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">Create</button>
                                    </div>
                                </div>
                                <div className="border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#e3e8ee] dark:border-white/10">
                                                <th className="w-8 px-3 py-2.5"><input type="checkbox" className="rounded border-[#c4cdd6]" /></th>
                                                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">Amount</th>
                                                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">Description</th>
                                                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">Date</th>
                                                <th className="w-8 px-3 py-2.5" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockPayments.map((p, i) => (
                                                <tr key={i} className="border-b border-[#f6f9fc] dark:border-white/5 last:border-0 hover:bg-[#f6f9fc] dark:hover:bg-white/3 transition-colors cursor-pointer">
                                                    <td className="px-3 py-2.5"><input type="checkbox" className="rounded border-[#c4cdd6]" /></td>
                                                    <td className="px-3 py-2.5">
                                                        <span className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">{p.amount}</span>
                                                        <span className="text-[12px] text-[#8792a2] dark:text-gray-500 ml-1">{p.currency}</span>
                                                        <span className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${statusCls[p.status]}`}>
                                                            <span className="w-1 h-1 rounded-full bg-current" />{p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[13px] text-[#697386] dark:text-gray-400">{p.desc}</td>
                                                    <td className="px-3 py-2.5 text-[13px] text-[#697386] dark:text-gray-400 whitespace-nowrap">{p.date}</td>
                                                    <td className="px-3 py-2.5">
                                                        <button className="text-[#a3acb9] hover:text-[#697386] transition-colors cursor-pointer"><MoreHorizontal className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Payment methods */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-[15px] font-semibold text-[#1a1f36] dark:text-white">Payment methods</h2>
                                    <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">Add</button>
                                </div>
                                <div className="border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <ChevronRight className="w-3.5 h-3.5 text-[#a3acb9]" />
                                        <div className="w-8 h-5 bg-[#1a1f8f] rounded flex items-center justify-center flex-shrink-0">
                                            <span className="text-[8px] font-bold text-white tracking-tight">VISA</span>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[13px] text-[#3c4257] dark:text-gray-200 font-medium">Visa ···· 4242</span>
                                            <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#e3e8ee] dark:bg-white/10 text-[#697386] dark:text-gray-400">Default</span>
                                            <p className="text-[12px] text-[#a3acb9] dark:text-gray-500 mt-0.5">Expires Apr 2022</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button className="p-1.5 text-[#697386] hover:text-[#3c4257] hover:bg-[#f6f9fc] dark:hover:bg-white/10 rounded transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 text-[#697386] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 text-[#697386] hover:text-[#3c4257] hover:bg-[#f6f9fc] dark:hover:bg-white/10 rounded transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Credit balance */}
                            <section>
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-[15px] font-semibold text-[#1a1f36] dark:text-white">Credit balance</h2>
                                    <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">Adjust balance</button>
                                </div>
                                <p className="text-[22px] font-bold text-[#1a1f36] dark:text-white tracking-tight">
                                    $0.00 <span className="text-[15px] font-medium text-[#8792a2]">USD</span>
                                </p>
                            </section>

                            {/* Invoices */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-[15px] font-semibold text-[#1a1f36] dark:text-white">Invoices</h2>
                                    <div className="flex items-center gap-3">
                                        <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">View all</button>
                                        <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer">Create</button>
                                    </div>
                                </div>
                                <div className="border border-[#e3e8ee] dark:border-white/10 rounded-lg px-4 py-3 text-[13px] text-[#a3acb9] dark:text-gray-500 italic">
                                    No invoices yet.
                                </div>
                            </section>
                        </div>
                    )}

                    {tab === 'events' && (
                        <div className="border border-[#e3e8ee] dark:border-white/10 rounded-lg px-6 py-10 text-center text-[13px] text-[#a3acb9] dark:text-gray-500 italic">
                            No events or logs to show.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}