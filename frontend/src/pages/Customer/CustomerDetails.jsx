import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft, ChevronDown, ChevronRight, Pencil, X, MoreHorizontal,
    Check, Copy, CreditCard, Plus, RefreshCw, Ban, Trash2,
    Download, Send, AlertCircle, CheckCircle2, Info, Bell
} from 'lucide-react';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_CUSTOMER = {
    id: 'cus_Qx7mK2nLpR8sT',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@acme.io',
    phone: '+1 (415) 555-0192',
    gst_number: '27AAPCS1822C1Z3',
    created_at: '2023-03-14T10:22:00Z',
};

const INIT_PAYMENTS = [
    { id: 'py_001', amount: 9.93, currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 14, 11:14 PM' },
    { id: 'py_002', amount: 2.00, currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 14, 1:06 AM' },
    { id: 'py_003', amount: 2.00, currency: 'USD', status: 'Refunded', desc: 'Subscription update', date: 'Sep 13, 1:05 AM' },
    { id: 'py_004', amount: 2.00, currency: 'USD', status: 'Succeeded', desc: 'Subscription update', date: 'Sep 12, 1:03 AM' },
    { id: 'py_005', amount: 2.00, currency: 'USD', status: 'Failed', desc: 'Subscription update', date: 'Sep 11, 1:03 AM' },
];

const INIT_EVENTS = [
    { id: 'ev_001', type: 'customer.subscription.updated', desc: 'Subscription was updated to Premium Plan', time: '2 hours ago', icon: 'refresh' },
    { id: 'ev_002', type: 'payment_intent.succeeded', desc: 'Payment of $9.93 succeeded', time: '2 hours ago', icon: 'check' },
    { id: 'ev_003', type: 'invoice.payment_succeeded', desc: 'Invoice #INV-2024-001 was paid', time: 'Sep 14', icon: 'check' },
    { id: 'ev_004', type: 'customer.updated', desc: 'Customer details were updated', time: 'Sep 13', icon: 'info' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => `$${Number(n).toFixed(2)}`;

const STATUS_CLS = {
    Succeeded: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Refunded: 'bg-amber-50 text-amber-700 border border-amber-200',
    Failed: 'bg-red-50 text-red-700 border border-red-200',
    Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const STATUS_DOT = {
    Succeeded: 'bg-emerald-500',
    Refunded: 'bg-amber-500',
    Failed: 'bg-red-500',
    Active: 'bg-emerald-500',
};

// ── Toast System ──────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id}
                    className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-[13px] font-medium animate-slideUp
                    ${t.type === 'success' ? 'bg-[#1a1f36] text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#1a1f36] text-white'}`}>
                    {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />}
                    {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    {t.msg}
                    <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const add = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(p => [...p, { id, msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };
    const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
    return { toasts, add, remove };
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, actions }) {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scaleIn">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e3e8ee]">
                    <h3 className="text-[16px] font-semibold text-[#1a1f36]">{title}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#f6f9fc] rounded-lg transition-colors cursor-pointer"><X className="w-4 h-4 text-[#697386]" /></button>
                </div>
                <div className="px-6 py-4">{children}</div>
                {actions && <div className="flex justify-end gap-2 px-6 pb-5">{actions}</div>}
            </div>
        </div>
    );
}

// ── Dropdown Menu ─────────────────────────────────────────────────────────────
function DropdownMenu({ trigger, items }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    return (
        <div ref={ref} className="relative">
            <div onClick={() => setOpen(v => !v)}>{trigger}</div>
            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#e3e8ee] rounded-xl shadow-xl z-30 py-1.5 animate-fadeIn">
                    {items.map((item, i) =>
                        item === 'divider' ? (
                            <div key={i} className="my-1.5 border-t border-[#e3e8ee]" />
                        ) : (
                            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
                                className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5
                                ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-[#3c4257] hover:bg-[#f6f9fc]'}`}>
                                {item.icon && <span className="text-[#8792a2]">{item.icon}</span>}
                                {item.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

// ── Field with inline edit ────────────────────────────────────────────────────
function EditableField({ label, value, onChange, type = 'text' }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    const commit = () => { onChange(val); setEditing(false); };
    return (
        <div>
            <p className="text-[11px] text-[#8792a2] font-medium mb-0.5">{label}</p>
            {editing ? (
                <div className="flex items-center gap-1.5">
                    <input type={type} value={val} onChange={e => setVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
                        className="flex-1 px-2 py-1 text-[13px] border border-[#5469d4] rounded-md outline-none focus:ring-2 focus:ring-[#5469d4]/20"
                        autoFocus />
                    <button onClick={commit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setVal(value); setEditing(false); }} className="p-1 text-[#697386] hover:bg-[#f6f9fc] rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 group/field">
                    <p className="text-[13px] text-[#3c4257]">{value || <span className="text-[#a3acb9] italic">Not set</span>}</p>
                    <button onClick={() => setEditing(true)}
                        className="opacity-0 group-hover/field:opacity-100 p-0.5 text-[#a3acb9] hover:text-[#5469d4] transition-all cursor-pointer">
                        <Pencil className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CustomerDetail() {
    const { toasts, add: addToast, remove: removeToast } = useToast();
    const [customer, setCustomer] = useState(MOCK_CUSTOMER);
    const [tab, setTab] = useState('overview');
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [payments, setPayments] = useState(INIT_PAYMENTS);
    const [selectedPayments, setSelectedPayments] = useState(new Set());
    const [creditBalance, setCreditBalance] = useState(0);
    const [invoices, setInvoices] = useState([]);
    const [copied, setCopied] = useState(false);

    // Modal states
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [creditModal, setCreditModal] = useState(false);
    const [creditAmount, setCreditAmount] = useState('');
    const [creditNote, setCreditNote] = useState('');
    const [addPaymentModal, setAddPaymentModal] = useState(false);
    const [newPayment, setNewPayment] = useState({ amount: '', desc: 'Manual charge' });
    const [addCardModal, setAddCardModal] = useState(false);
    const [createInvoiceModal, setCreateInvoiceModal] = useState(false);
    const [invoiceDesc, setInvoiceDesc] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [cancelSubModal, setCancelSubModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [subscriptionActive, setSubscriptionActive] = useState(true);
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const actionRef = useRef();

    useEffect(() => {
        const handler = (e) => { if (actionRef.current && !actionRef.current.contains(e.target)) setActionMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const copyId = () => {
        navigator.clipboard.writeText(customer.id).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addToast('Customer ID copied', 'success');
    };

    const openEdit = () => { setEditForm({ ...customer }); setEditModal(true); };
    const saveEdit = () => {
        setCustomer({ ...customer, ...editForm });
        setEditModal(false);
        addToast('Customer details updated', 'success');
    };

    const adjustCredit = () => {
        const amt = parseFloat(creditAmount);
        if (isNaN(amt)) return addToast('Enter a valid amount', 'error');
        setCreditBalance(b => Math.max(0, b + amt));
        setCreditModal(false);
        setCreditAmount('');
        setCreditNote('');
        addToast(`Credit balance adjusted by ${fmtMoney(amt)}`, 'success');
    };

    const addPayment = () => {
        const amt = parseFloat(newPayment.amount);
        if (isNaN(amt) || amt <= 0) return addToast('Enter a valid amount', 'error');
        const p = {
            id: `py_${Date.now()}`,
            amount: amt,
            currency: 'USD',
            status: 'Succeeded',
            desc: newPayment.desc || 'Manual charge',
            date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        };
        setPayments(prev => [p, ...prev]);
        setAddPaymentModal(false);
        setNewPayment({ amount: '', desc: 'Manual charge' });
        addToast(`Payment of ${fmtMoney(amt)} created`, 'success');
    };

    const refundPayment = (id) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Refunded' } : p));
        addToast('Payment refunded', 'success');
    };

    const deletePayment = (id) => {
        setPayments(prev => prev.filter(p => p.id !== id));
        setSelectedPayments(prev => { const s = new Set(prev); s.delete(id); return s; });
        addToast('Payment removed', 'info');
    };

    const toggleSelect = (id) => {
        setSelectedPayments(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const toggleSelectAll = () => {
        setSelectedPayments(prev => prev.size === payments.length ? new Set() : new Set(payments.map(p => p.id)));
    };

    const createInvoice = () => {
        const amt = parseFloat(invoiceAmount);
        if (!invoiceDesc || isNaN(amt)) return addToast('Fill in all fields', 'error');
        const inv = {
            id: `inv_${Date.now()}`,
            desc: invoiceDesc,
            amount: amt,
            status: 'Open',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        setInvoices(prev => [inv, ...prev]);
        setCreateInvoiceModal(false);
        setInvoiceDesc('');
        setInvoiceAmount('');
        addToast('Invoice created', 'success');
    };

    const cancelSub = () => {
        setSubscriptionActive(false);
        setCancelSubModal(false);
        addToast('Subscription cancelled', 'info');
    };

    const totalSpent = payments.filter(p => p.status === 'Succeeded').reduce((sum, p) => sum + p.amount, 0);

    const fieldLabel = 'text-[11px] text-[#8792a2] font-medium mb-0.5';
    const fieldVal = 'text-[13px] text-[#3c4257]';

    return (
        <>
            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
                @keyframes scaleIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
                .animate-slideUp { animation: slideUp .25s ease; }
                .animate-fadeIn { animation: fadeIn .15s ease; }
                .animate-scaleIn { animation: scaleIn .2s ease; }
            `}</style>

            <Toast toasts={toasts} remove={removeToast} />

            <div className="max-w-6xl mx-auto px-4 py-6 font-sans">

                {/* Back */}
                <button className="flex items-center gap-1.5 text-[13px] text-[#5469d4] hover:text-[#4a5fc1] mb-5 transition-colors cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Customers
                </button>

                <div className="flex gap-6 items-start">

                    {/* ── LEFT PANEL ── */}
                    <div className="w-[260px] flex-shrink-0 space-y-4">
                        <div>
                            <h1 className="text-[22px] font-bold text-[#1a1f36] tracking-tight">{customer.name}</h1>
                            <p className="text-[13px] text-[#697386] mt-0.5">{customer.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Spent', value: fmtMoney(totalSpent) },
                                { label: 'Since', value: fmt(customer.created_at) },
                                { label: 'MRR', value: subscriptionActive ? '$9.99' : '$0.00' },
                            ].map(s => (
                                <div key={s.label}>
                                    <p className="text-[11px] text-[#8792a2] font-medium">{s.label}</p>
                                    <p className="text-[13px] font-semibold text-[#1a1f36] mt-0.5">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Details */}
                        <div className="border-t border-[#e3e8ee] pt-3">
                            <button onClick={() => setDetailsOpen(v => !v)}
                                className="flex items-center justify-between w-full text-[13px] font-semibold text-[#1a1f36] mb-2 hover:text-[#5469d4] transition-colors cursor-pointer">
                                <span className="flex items-center gap-1">
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${detailsOpen ? '' : '-rotate-90'}`} />
                                    Details
                                </span>
                                <span onClick={(e) => { e.stopPropagation(); openEdit(); }}
                                    className="text-[12px] text-[#5469d4] font-medium hover:text-[#4a5fc1] cursor-pointer">Edit</span>
                            </button>

                            {detailsOpen && (
                                <div className="space-y-3">
                                    {/* ID with copy */}
                                    <button onClick={copyId}
                                        className="flex items-center gap-2 w-full bg-[#f6f9fc] hover:bg-[#eef2f7] border border-[#e3e8ee] rounded px-2.5 py-1.5 font-mono text-[11px] text-[#697386] truncate transition-colors cursor-pointer group">
                                        <span className="flex-1 text-left truncate">{customer.id}</span>
                                        {copied ? <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />}
                                    </button>

                                    <div>
                                        <p className={fieldLabel}>Account details</p>
                                        <p className={fieldVal}>{customer.name}</p>
                                        <p className={fieldVal}>{customer.email}</p>
                                    </div>
                                    {customer.phone && (
                                        <div>
                                            <p className={fieldLabel}>Phone</p>
                                            <p className={fieldVal}>{customer.phone}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className={fieldLabel}>Billing emails</p>
                                        <p className={fieldVal}>{customer.email}</p>
                                    </div>
                                    {customer.gst_number && (
                                        <div>
                                            <p className={fieldLabel}>GST Number</p>
                                            <p className={`${fieldVal} font-mono`}>{customer.gst_number}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="border-t border-[#e3e8ee] pt-3">
                            <button onClick={() => addToast('Metadata editor coming soon', 'info')}
                                className="flex items-center gap-1 text-[13px] font-semibold text-[#1a1f36] hover:text-[#5469d4] transition-colors cursor-pointer">
                                <ChevronRight className="w-3.5 h-3.5" /> Metadata
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div className="flex-1 min-w-0">

                        {/* Tabs + Actions */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center border-b border-[#e3e8ee] w-full">
                                {['overview', 'events'].map(t => (
                                    <button key={t} onClick={() => setTab(t)}
                                        className={`px-4 py-2 text-[13px] font-medium capitalize transition-colors border-b-2 -mb-px cursor-pointer
                                        ${tab === t ? 'border-[#5469d4] text-[#5469d4]' : 'border-transparent text-[#697386] hover:text-[#3c4257]'}`}>
                                        {t === 'overview' ? 'Overview' : 'Events and logs'}
                                    </button>
                                ))}
                                <div className="flex-1" />
                                {/* Actions dropdown */}
                                <div ref={actionRef} className="relative mb-1">
                                    <button onClick={() => setActionMenuOpen(v => !v)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#5469d4] hover:bg-[#4a5fc1] active:bg-[#3d52b0] text-white text-[13px] font-medium rounded-md transition-colors cursor-pointer shadow-sm">
                                        Actions <ChevronDown className={`w-3.5 h-3.5 transition-transform ${actionMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {actionMenuOpen && (
                                        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#e3e8ee] rounded-xl shadow-xl z-30 py-1.5 animate-fadeIn">
                                            {[
                                                { label: 'Edit customer', icon: <Pencil className="w-3.5 h-3.5" />, onClick: () => { openEdit(); setActionMenuOpen(false); } },
                                                { label: 'Send email receipt', icon: <Send className="w-3.5 h-3.5" />, onClick: () => { addToast('Email receipt sent', 'success'); setActionMenuOpen(false); } },
                                                { label: 'Create payment', icon: <Plus className="w-3.5 h-3.5" />, onClick: () => { setAddPaymentModal(true); setActionMenuOpen(false); } },
                                                { label: 'Create invoice', icon: <Download className="w-3.5 h-3.5" />, onClick: () => { setCreateInvoiceModal(true); setActionMenuOpen(false); } },
                                                'divider',
                                                { label: 'Delete customer', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true, onClick: () => { setDeleteModal(true); setActionMenuOpen(false); } },
                                            ].map((item, i) => item === 'divider' ? (
                                                <div key={i} className="my-1.5 border-t border-[#e3e8ee]" />
                                            ) : (
                                                <button key={i} onClick={item.onClick}
                                                    className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors cursor-pointer flex items-center gap-2.5
                                                    ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-[#3c4257] hover:bg-[#f6f9fc]'}`}>
                                                    <span className={item.danger ? 'text-red-400' : 'text-[#8792a2]'}>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {tab === 'overview' && (
                            <div className="space-y-6">

                                {/* Subscriptions */}
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-[15px] font-semibold text-[#1a1f36]">Subscriptions</h2>
                                        <button onClick={() => addToast('Subscription created', 'success')}
                                            className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">Create</button>
                                    </div>
                                    <div className="border border-[#e3e8ee] rounded-lg overflow-hidden">
                                        {subscriptionActive ? (
                                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f9fc] transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <div className="w-4 h-4 rounded-full bg-emerald-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-semibold text-[#1a1f36]">Premium Plan</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_CLS.Active}`}>Active</span>
                                                    </div>
                                                    <p className="text-[12px] text-[#697386] mt-0.5">Billing monthly · Next invoice on Oct 14 for $9.99</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => addToast('Edit subscription coming soon', 'info')}
                                                        className="p-1.5 text-[#697386] hover:text-[#3c4257] hover:bg-[#f0f4f8] rounded transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => setCancelSubModal(true)}
                                                        className="p-1.5 text-[#697386] hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                                    <DropdownMenu
                                                        trigger={<button className="p-1.5 text-[#697386] hover:text-[#3c4257] hover:bg-[#f0f4f8] rounded transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>}
                                                        items={[
                                                            { label: 'View subscription', onClick: () => addToast('Opening subscription…', 'info') },
                                                            { label: 'Pause subscription', icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: () => addToast('Subscription paused', 'info') },
                                                            { label: 'Cancel subscription', icon: <Ban className="w-3.5 h-3.5" />, danger: true, onClick: () => setCancelSubModal(true) },
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-[13px] text-[#a3acb9] italic">No active subscriptions.</p>
                                                <button onClick={() => { setSubscriptionActive(true); addToast('Subscription reactivated', 'success'); }}
                                                    className="mt-2 text-[13px] text-[#5469d4] hover:underline cursor-pointer">Reactivate</button>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Payments */}
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-[15px] font-semibold text-[#1a1f36]">Payments
                                            {selectedPayments.size > 0 && (
                                                <span className="ml-2 text-[12px] font-normal text-[#697386]">{selectedPayments.size} selected</span>
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            {selectedPayments.size > 0 && (
                                                <button onClick={() => { selectedPayments.forEach(id => deletePayment(id)); setSelectedPayments(new Set()); }}
                                                    className="text-[13px] text-red-500 hover:text-red-600 font-medium cursor-pointer transition-colors">Delete selected</button>
                                            )}
                                            <button onClick={() => addToast('Showing all payments', 'info')}
                                                className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">View all</button>
                                            <button onClick={() => setAddPaymentModal(true)}
                                                className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">Create</button>
                                        </div>
                                    </div>
                                    <div className="border border-[#e3e8ee] rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#e3e8ee] bg-[#fafbfc]">
                                                    <th className="w-8 px-3 py-2.5">
                                                        <input type="checkbox"
                                                            checked={selectedPayments.size === payments.length && payments.length > 0}
                                                            onChange={toggleSelectAll}
                                                            className="rounded border-[#c4cdd6] cursor-pointer" />
                                                    </th>
                                                    {['Amount', 'Description', 'Date', ''].map((h, i) => (
                                                        <th key={i} className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] ${i === 3 ? 'w-8' : ''}`}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((p) => (
                                                    <tr key={p.id}
                                                        className={`border-b border-[#f6f9fc] last:border-0 hover:bg-[#f6f9fc] transition-colors cursor-pointer
                                                        ${selectedPayments.has(p.id) ? 'bg-[#f0f4ff]' : ''}`}>
                                                        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                                                            <input type="checkbox" checked={selectedPayments.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-[#c4cdd6] cursor-pointer" />
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <span className="text-[13px] font-semibold text-[#1a1f36]">{fmtMoney(p.amount)}</span>
                                                            <span className="text-[12px] text-[#8792a2] ml-1">{p.currency}</span>
                                                            <span className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${STATUS_CLS[p.status]}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status]}`} />{p.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-[13px] text-[#697386]">{p.desc}</td>
                                                        <td className="px-3 py-2.5 text-[13px] text-[#697386] whitespace-nowrap">{p.date}</td>
                                                        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                                                            <DropdownMenu
                                                                trigger={<button className="text-[#a3acb9] hover:text-[#697386] transition-colors cursor-pointer p-1 hover:bg-[#f0f4f8] rounded"><MoreHorizontal className="w-4 h-4" /></button>}
                                                                items={[
                                                                    { label: 'View details', onClick: () => addToast(`Payment ${p.id}`, 'info') },
                                                                    ...(p.status === 'Succeeded' ? [{ label: 'Refund payment', icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: () => refundPayment(p.id) }] : []),
                                                                    { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true, onClick: () => deletePayment(p.id) },
                                                                ]}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {payments.length === 0 && (
                                                    <tr><td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#a3acb9] italic">No payments yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Payment methods */}
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-[15px] font-semibold text-[#1a1f36]">Payment methods</h2>
                                        <button onClick={() => setAddCardModal(true)}
                                            className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">Add</button>
                                    </div>
                                    <div className="border border-[#e3e8ee] rounded-lg overflow-hidden">
                                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f9fc] transition-colors">
                                            <ChevronRight className="w-3.5 h-3.5 text-[#a3acb9]" />
                                            <div className="w-8 h-5 bg-[#1a1f8f] rounded flex items-center justify-center flex-shrink-0">
                                                <span className="text-[8px] font-bold text-white tracking-tight">VISA</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] text-[#3c4257] font-medium">Visa ···· 4242</span>
                                                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#e3e8ee] text-[#697386]">Default</span>
                                                </div>
                                                <p className="text-[12px] text-[#a3acb9] mt-0.5">Expires Apr 2026</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => addToast('Card updated', 'success')}
                                                    className="p-1.5 text-[#697386] hover:text-[#3c4257] hover:bg-[#f0f4f8] rounded transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => addToast('Card removed', 'info')}
                                                    className="p-1.5 text-[#697386] hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                                <DropdownMenu
                                                    trigger={<button className="p-1.5 text-[#697386] hover:text-[#3c4257] hover:bg-[#f0f4f8] rounded transition-colors cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>}
                                                    items={[
                                                        { label: 'Set as default', onClick: () => addToast('Set as default card', 'success') },
                                                        { label: 'Remove card', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true, onClick: () => addToast('Card removed', 'info') },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Credit balance */}
                                <section>
                                    <div className="flex items-center justify-between mb-1">
                                        <h2 className="text-[15px] font-semibold text-[#1a1f36]">Credit balance</h2>
                                        <button onClick={() => setCreditModal(true)}
                                            className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">Adjust balance</button>
                                    </div>
                                    <p className="text-[22px] font-bold text-[#1a1f36] tracking-tight">
                                        {fmtMoney(creditBalance)} <span className="text-[15px] font-medium text-[#8792a2]">USD</span>
                                    </p>
                                </section>

                                {/* Invoices */}
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-[15px] font-semibold text-[#1a1f36]">Invoices</h2>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => addToast('Showing all invoices', 'info')}
                                                className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">View all</button>
                                            <button onClick={() => setCreateInvoiceModal(true)}
                                                className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium cursor-pointer transition-colors">Create</button>
                                        </div>
                                    </div>
                                    <div className="border border-[#e3e8ee] rounded-lg overflow-hidden">
                                        {invoices.length === 0 ? (
                                            <div className="px-4 py-4 text-[13px] text-[#a3acb9] italic">No invoices yet.</div>
                                        ) : (
                                            <table className="w-full">
                                                <tbody>
                                                    {invoices.map(inv => (
                                                        <tr key={inv.id} className="border-b border-[#f6f9fc] last:border-0 hover:bg-[#f6f9fc] transition-colors cursor-pointer">
                                                            <td className="px-4 py-3 text-[13px] font-medium text-[#1a1f36]">{inv.desc}</td>
                                                            <td className="px-4 py-3 text-[13px] text-[#697386]">{inv.date}</td>
                                                            <td className="px-4 py-3 text-[13px] font-semibold text-[#1a1f36]">{fmtMoney(inv.amount)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">{inv.status}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button onClick={() => addToast(`Invoice ${inv.id} sent`, 'success')}
                                                                    className="text-[13px] text-[#5469d4] hover:underline cursor-pointer">Send</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {tab === 'events' && (
                            <div className="space-y-2">
                                {INIT_EVENTS.map(ev => (
                                    <div key={ev.id} className="flex items-start gap-3 border border-[#e3e8ee] rounded-lg px-4 py-3 hover:bg-[#f6f9fc] transition-colors cursor-pointer">
                                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${ev.icon === 'check' ? 'bg-emerald-100' : ev.icon === 'refresh' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            {ev.icon === 'check' && <Check className="w-3 h-3 text-emerald-600" />}
                                            {ev.icon === 'refresh' && <RefreshCw className="w-3 h-3 text-blue-600" />}
                                            {ev.icon === 'info' && <Info className="w-3 h-3 text-gray-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-[#1a1f36]">{ev.desc}</p>
                                            <p className="text-[11px] text-[#a3acb9] mt-0.5 font-mono">{ev.type}</p>
                                        </div>
                                        <span className="text-[12px] text-[#a3acb9] whitespace-nowrap flex-shrink-0">{ev.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MODALS ── */}

            {/* Edit customer */}
            <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit customer"
                actions={<>
                    <button onClick={() => setEditModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] transition-colors cursor-pointer">Cancel</button>
                    <button onClick={saveEdit} className="px-4 py-2 text-[13px] font-medium bg-[#5469d4] hover:bg-[#4a5fc1] text-white rounded-lg transition-colors cursor-pointer">Save changes</button>
                </>}>
                <div className="space-y-3">
                    {[
                        { label: 'Full name', key: 'name' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Phone', key: 'phone' },
                        { label: 'GST Number', key: 'gst_number' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-[12px] font-medium text-[#697386] mb-1">{f.label}</label>
                            <input type={f.type || 'text'} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20 transition" />
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Credit balance */}
            <Modal open={creditModal} onClose={() => setCreditModal(false)} title="Adjust credit balance"
                actions={<>
                    <button onClick={() => setCreditModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] cursor-pointer">Cancel</button>
                    <button onClick={adjustCredit} className="px-4 py-2 text-[13px] font-medium bg-[#5469d4] hover:bg-[#4a5fc1] text-white rounded-lg cursor-pointer">Apply</button>
                </>}>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Amount (USD) — use negative to deduct</label>
                        <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="e.g. 10.00"
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20" />
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Note (optional)</label>
                        <input type="text" value={creditNote} onChange={e => setCreditNote(e.target.value)} placeholder="Reason for adjustment"
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20" />
                    </div>
                    <p className="text-[12px] text-[#697386]">Current balance: <strong>{fmtMoney(creditBalance)} USD</strong></p>
                </div>
            </Modal>

            {/* Add payment */}
            <Modal open={addPaymentModal} onClose={() => setAddPaymentModal(false)} title="Create payment"
                actions={<>
                    <button onClick={() => setAddPaymentModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] cursor-pointer">Cancel</button>
                    <button onClick={addPayment} className="px-4 py-2 text-[13px] font-medium bg-[#5469d4] hover:bg-[#4a5fc1] text-white rounded-lg cursor-pointer">Charge</button>
                </>}>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Amount (USD)</label>
                        <input type="number" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20" />
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Description</label>
                        <input type="text" value={newPayment.desc} onChange={e => setNewPayment(p => ({ ...p, desc: e.target.value }))}
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20" />
                    </div>
                </div>
            </Modal>

            {/* Add card */}
            <Modal open={addCardModal} onClose={() => setAddCardModal(false)} title="Add payment method"
                actions={<>
                    <button onClick={() => setAddCardModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] cursor-pointer">Cancel</button>
                    <button onClick={() => { setAddCardModal(false); addToast('Card added successfully', 'success'); }}
                        className="px-4 py-2 text-[13px] font-medium bg-[#5469d4] hover:bg-[#4a5fc1] text-white rounded-lg cursor-pointer">Add card</button>
                </>}>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Card number</label>
                        <input type="text" placeholder="4242 4242 4242 4242" maxLength={19}
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[12px] font-medium text-[#697386] mb-1">Expiry</label>
                            <input type="text" placeholder="MM / YY" maxLength={7}
                                className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20 font-mono" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-medium text-[#697386] mb-1">CVC</label>
                            <input type="text" placeholder="CVC" maxLength={4}
                                className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20 font-mono" />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Create invoice */}
            <Modal open={createInvoiceModal} onClose={() => setCreateInvoiceModal(false)} title="Create invoice"
                actions={<>
                    <button onClick={() => setCreateInvoiceModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] cursor-pointer">Cancel</button>
                    <button onClick={createInvoice} className="px-4 py-2 text-[13px] font-medium bg-[#5469d4] hover:bg-[#4a5fc1] text-white rounded-lg cursor-pointer">Create</button>
                </>}>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Description</label>
                        <input type="text" value={invoiceDesc} onChange={e => setInvoiceDesc(e.target.value)} placeholder="Professional services"
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20" />
                    </div>
                    <div>
                        <label className="block text-[12px] font-medium text-[#697386] mb-1">Amount (USD)</label>
                        <input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="0.00"
                            className="w-full px-3 py-2 text-[13px] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#5469d4] focus:ring-2 focus:ring-[#5469d4]/20" />
                    </div>
                </div>
            </Modal>

            {/* Cancel subscription confirm */}
            <Modal open={cancelSubModal} onClose={() => setCancelSubModal(false)} title="Cancel subscription"
                actions={<>
                    <button onClick={() => setCancelSubModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] cursor-pointer">Keep subscription</button>
                    <button onClick={cancelSub} className="px-4 py-2 text-[13px] font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer">Cancel subscription</button>
                </>}>
                <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-[14px] text-[#1a1f36] font-medium">Cancel Premium Plan?</p>
                        <p className="text-[13px] text-[#697386] mt-1">The customer will lose access at the end of the billing period. This action cannot be undone.</p>
                    </div>
                </div>
            </Modal>

            {/* Delete customer confirm */}
            <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete customer"
                actions={<>
                    <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#697386] hover:text-[#3c4257] cursor-pointer">Cancel</button>
                    <button onClick={() => { setDeleteModal(false); addToast('Customer deleted', 'error'); }}
                        className="px-4 py-2 text-[13px] font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer">Delete permanently</button>
                </>}>
                <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-[14px] text-[#1a1f36] font-medium">Delete {customer.name}?</p>
                        <p className="text-[13px] text-[#697386] mt-1">All associated data including payments, subscriptions, and invoices will be permanently removed.</p>
                    </div>
                </div>
            </Modal>
        </>
    );
}