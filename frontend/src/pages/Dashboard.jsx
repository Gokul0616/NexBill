import {
  Users, CreditCard, FileText, Repeat, ArrowUpRight, ArrowDownRight,
  Plus, ChevronDown, MoreHorizontal, Loader2, CheckCircle,
  RefreshCw, Download, Bell, Settings, Filter, Search,
  AlertTriangle, Link, ChevronRight, LayoutGrid,
} from 'lucide-react';
import { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';
import DataTable from '../components/DataTable';
import RevenueLineChart from '../components/RevenueLineChart';

// ─────────────────────────────────────────────────────────────
// Tiny bar chart (no library needed)
// ─────────────────────────────────────────────────────────────
function MiniBarChart({ data = [], color = '#1d4ed8' }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div className="flex items-end gap-[2px] h-[110px]">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px] transition-colors hover:opacity-80 cursor-pointer"
          style={{
            height: `${Math.max(3, (d.v / max) * 100)}px`,
            backgroundColor: color,
            opacity: d.v === 0 ? 0.12 : 0.9,
          }}
          title={`$${d.v.toLocaleString()}`}
        />
      ))}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// KPI card in the top strip
// ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, sub, iconBg, icon: Icon, iconColor, last }) {
  const neutral = !delta || delta === '—';
  const up = delta?.startsWith('+');
  return (
    <div className={`flex flex-col gap-2 px-4 py-3.5 ${!last ? 'border-r border-[#e5e7eb] dark:border-white/10' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold text-[#111827] dark:text-white">{label}</span>
        <span
          className="w-[24px] h-[24px] rounded-[5px] flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        </span>
      </div>
      <div className="text-[21px] font-semibold text-[#111827] dark:text-white tracking-[-0.5px] leading-none">
        {value}
      </div>
      <div className="flex items-center gap-1.5">
        {delta && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded ${neutral ? 'bg-[#f3f4f6] text-[#6b7280]' :
            up ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fee2e2] text-[#991b1b]'
            }`}>
            {!neutral && (up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
            {delta}
          </span>
        )}
        <span className="text-[11px] text-[#9ca3af]">{sub}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────
const statusCfg = {
  paid: { cls: 'bg-[#d1fae5] text-[#065f46] dark:bg-green-900/30 dark:text-green-400', dot: 'bg-[#059669]' },
  refunded: { cls: 'bg-[#dbeafe] text-[#1e40af] dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-[#3b82f6]' },
  unpaid: { cls: 'bg-[#fef3c7] text-[#92400e] dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-[#f59e0b]' },
  failed: { cls: 'bg-[#fee2e2] text-[#991b1b] dark:bg-red-900/30 dark:text-red-400', dot: 'bg-[#ef4444]' },
};

// Slightly smaller status badge
function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.unpaid;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
];

const QUICK_ACTIONS = [
  { icon: Users, label: 'Add customer', sub: 'Create a new profile', bg: '#eff6ff', ic: '#3b82f6' },
  { icon: Repeat, label: 'New subscription', sub: 'Enroll into a plan', bg: '#faf5ff', ic: '#a855f7' },
  { icon: FileText, label: 'Create invoice', sub: 'One-off or recurring', bg: '#f0fdf4', ic: '#22c55e' },
  { icon: CreditCard, label: 'Create plan', sub: 'Set up pricing tier', bg: '#fff7ed', ic: '#f97316' },
  { icon: Link, label: 'Payment link', sub: 'Share to collect payment', bg: '#f0f9ff', ic: '#0891b2' },
];

export default function Dashboard() {
  const { testMode } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/invoices/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-[#1d4ed8]" />
      </div>
    );
  }

  const d = stats || { totalMRR: 0, pendingInvoices: 0, recentPayments: [], verificationStatus: 'pending' };

  const isDemo = true;
  // const isDemo = !d.recentPayments || d.recentPayments.length === 0;

  const tempPayments = [
    {
      id: 'tx_982468',
      customer_name: 'Gokul',
      customer_email: 'gokul@gmail.com',
      amount: '1250.00',
      status: 'paid',
      created_at: new Date().toISOString()
    },
    {
      id: 'tx_327891',
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      amount: '450.00',
      status: 'paid',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'tx_781290',
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      amount: '89.00',
      status: 'failed',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  const paymentsData = isDemo ? tempPayments : d.recentPayments;
  const mrrVal = d.totalMRR || 1789.00;
  const pendingVal = d.pendingInvoices || 2;

  // Build 18-bar dataset from real/demo data
  const barData = isDemo
    ? [
      { v: 120, date: 'Jan 1' }, { v: 240, date: 'Jan 2' }, { v: 180, date: 'Jan 3' },
      { v: 310, date: 'Jan 4' }, { v: 490, date: 'Jan 5' }, { v: 620, date: 'Jan 6' },
      { v: 450, date: 'Jan 7' }, { v: 580, date: 'Jan 8' }, { v: 720, date: 'Jan 9' },
      { v: 690, date: 'Jan 10' }, { v: 850, date: 'Jan 11' }, { v: 920, date: 'Jan 12' },
      { v: 1100, date: 'Jan 13' }, { v: 980, date: 'Jan 14' }, { v: 1250, date: 'Jan 15' },
      { v: 1420, date: 'Jan 16' }, { v: 1310, date: 'Jan 17' }, { v: 1789, date: 'Jan 18' },
    ]
    : Array.from({ length: 18 }, (_, i) => ({
      v: i === 17 ? (d.totalMRR || 0) : 0,
      date: `Day ${i + 1}`,
    }));

  return (
    <div className="mx-auto pb-6 space-y-3 font-sans">

      {/* ── Topbar ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold text-[#111827] dark:text-white tracking-tight">Dashboard</h1>
            {testMode && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.8px] bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] px-1.5 py-0.5 rounded">
                Test mode
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-px h-5 bg-[#e5e7eb] dark:bg-white/10" />
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#374151] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#e5e7eb] dark:border-white/10 rounded-md hover:bg-[#f9fafb] dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#374151] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#e5e7eb] dark:border-white/10 rounded-md hover:bg-[#f9fafb] dark:hover:bg-white/10 cursor-pointer transition-colors">
            <Download className="w-3 h-3" />
            Export
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] rounded-md cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New payment
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* ── Period bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 bg-white dark:bg-white/5 border border-[#e5e7eb] dark:border-white/10 rounded-lg p-1">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-[12px] font-bold px-3.5 py-1.5 rounded-[5px] cursor-pointer transition-all ${period === p.key
                ? 'bg-[#1d4ed8] text-white'
                : 'text-[#6b7280] hover:bg-[#f3f4f6] dark:hover:bg-white/10 hover:text-[#374151] dark:hover:text-gray-300'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-[#9ca3af]">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · UTC+05:30
        </span>
      </div>

      {/* ── KPI strip ── */}
      <div className="bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden grid grid-cols-5">
        <KpiCard label="Gross volume" value={`$${mrrVal.toLocaleString()}`} delta={isDemo ? "+12.4%" : "+0%"} sub="vs last period" iconBg="#eff6ff" icon={ArrowUpRight} iconColor="#3b82f6" />
        <KpiCard label="Net revenue" value={`$${(mrrVal * 0.971 - pendingVal * 30).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} delta={isDemo ? "+9.8%" : "+0%"} sub="after fees" iconBg="#f0fdf4" icon={CheckCircle} iconColor="#22c55e" />
        <KpiCard label="Pending invoices" value={pendingVal} delta={isDemo ? "-4" : "—"} sub="outstanding" iconBg="#fffbeb" icon={FileText} iconColor="#f59e0b" />
        <KpiCard label="New customers" value={isDemo ? "14" : "—"} delta={isDemo ? "+15%" : "—"} sub="this period" iconBg="#faf5ff" icon={Users} iconColor="#a855f7" />
        <KpiCard label="Success rate" value={isDemo ? "94.6%" : "—%"} sub={isDemo ? "35 payments" : "no transactions"} iconBg="#f0fdf4" icon={CheckCircle} iconColor="#22c55e" last />
      </div>
      <div>
        {/* Volume chart */}
        <div className="bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f3f4f6] dark:border-white/10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#9ca3af]">Gross volume</p>
              <p className="text-[22px] font-semibold text-[#111827] dark:text-white tracking-tight">
                ${mrrVal.toLocaleString()}
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] text-[#6b7280] border border-[#e5e7eb] dark:border-white/10 rounded px-3 py-1.5 hover:bg-[#f9fafb] dark:hover:bg-white/5">
              Daily <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-4 pt-4 pb-4">
            <RevenueLineChart
              data={barData}
              color="#6366f1"
            />
          </div>
        </div>
      </div>
      {/* ── Mid row: chart + methods + activity ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Payment methods */}
        <div className="bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f3f4f6] dark:border-white/10">
            <p className="text-[13px] font-bold text-[#111827] dark:text-white">Payment methods</p>
            <span className="text-[12px] text-[#9ca3af]">by volume</span>
          </div>
          <div className="px-4 py-3.5">
            {/* Segment bar */}
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-2.5">
              {[['#1d4ed8', '60%'], ['#7c3aed', '25%'], ['#0891b2', '10%'], ['#d1d5db', '5%']].map(([c, w], i) => (
                <div key={i} className="rounded-sm" style={{ width: w, background: c }} />
              ))}
            </div>
            <div className="flex gap-3.5 flex-wrap mb-4">
              {[['#1d4ed8', 'Card 60%'], ['#7c3aed', 'Bank 25%'], ['#0891b2', 'Wallet 10%'], ['#d1d5db', 'Other 5%']].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1 text-[11px] text-[#6b7280]">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
            {/* Bar breakdown */}
            {[['Visa', '#1d4ed8', 0], ['Mastercard', '#7c3aed', 0], ['UPI', '#0891b2', 0], ['NetBanking', '#d1d5db', 0]].map(([label, color, pct]) => (
              <div key={label} className="flex items-center gap-2 mb-2">
                <span className="text-[12px] text-[#6b7280] w-22 text-right">{label}</span>
                <div className="flex-1 h-[6px] bg-[#f3f4f6] dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-[12px] font-bold text-[#111827] dark:text-white w-8 text-right">0%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f3f4f6] dark:border-white/10">
            <p className="text-[13px] font-bold text-[#111827] dark:text-white">Activity feed</p>
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" title="Live" />
          </div>
          <div className="flex-1 px-4 py-2.5">
            {[
              { color: '#f59e0b', text: <><span className="font-semibold text-[#111827] dark:text-white">Verification pending</span> — complete KYC to enable payouts</>, time: 'Now' },
              { color: '#3b82f6', text: <><span className="font-semibold text-[#111827] dark:text-white">Test mode</span> active — payments are simulated</>, time: 'Today' },
              { color: '#a855f7', text: <>Account created. <span className="font-semibold text-[#111827] dark:text-white">Add your first product</span> to start</>, time: 'May 18' },
              { color: '#d1d5db', text: <>Stripe webhook endpoint <span className="font-semibold text-[#111827] dark:text-white">not configured</span></>, time: 'May 17' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2 border-b border-[#f9fafb] dark:border-white/5 last:border-0">
                <span className="w-[7px] h-[7px] rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                <p className="flex-1 text-[12px] text-[#374151] dark:text-gray-400 leading-snug">{item.text}</p>
                <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3.5 border-t border-[#f3f4f6] dark:border-white/10">
            <button className="w-full text-[12px] font-semibold text-[#374151] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#e5e7eb] dark:border-white/10 rounded-md py-1.5 hover:bg-[#f9fafb] dark:hover:bg-white/10 cursor-pointer transition-colors">
              View all activity
            </button>
          </div>
        </div>
      </div>

      {/* ── Payments table ── */}
      <DataTable
        title="Payments"
        idKey="id"
        data={paymentsData}
        withSearch
        withSelection
        withColumnVisibility
        withExport
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20]}
        columns={[
          {
            key: 'id',
            label: 'ID',
            sortable: true,
            width: 92,
            render: (val, row, i) => (
              <span className="font-mono text-[11px] text-[#9ca3af]">
                #{String(val || i + 1001).slice(-6)}
              </span>
            )
          },
          {
            key: 'customer_name',
            label: 'Customer',
            sortable: true,
            width: 170,
            render: (val, row, i) => {
              const initials = (val || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              const avatarColors = ['#eff6ff|#3b82f6', '#f0fdf4|#22c55e', '#faf5ff|#a855f7', '#fff7ed|#f97316'];
              const [abg, afc] = avatarColors[i % avatarColors.length].split('|');
              return (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: abg, color: afc }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#111827] dark:text-white truncate">{val}</p>
                    <p className="text-[11px] text-[#9ca3af] truncate">{row.customer_email}</p>
                  </div>
                </div>
              );
            }
          },
          {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            align: 'right',
            width: 90,
            render: (val) => {
              const amt = parseFloat(val) || 0;
              return `$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          },
          {
            key: 'fee',
            label: 'Fee',
            sortable: false,
            align: 'right',
            width: 62,
            render: (val, row) => {
              const amt = parseFloat(row.amount) || 0;
              const fee = +(amt * 0.029 + 0.30).toFixed(2);
              return `$${fee.toFixed(2)}`;
            }
          },
          {
            key: 'net',
            label: 'Net',
            sortable: false,
            align: 'right',
            width: 82,
            render: (val, row) => {
              const amt = parseFloat(row.amount) || 0;
              const fee = +(amt * 0.029 + 0.30).toFixed(2);
              const net = +(amt - fee).toFixed(2);
              return `$${net.toFixed(2)}`;
            }
          },
          {
            key: 'method',
            label: 'Method',
            sortable: false,
            width: 78,
            render: () => (
              <span className="flex items-center gap-1 text-[12px] text-[#6b7280] dark:text-gray-400">
                <CreditCard className="w-3 h-3" />
                Card
              </span>
            )
          },
          {
            key: 'created_at',
            label: 'Date',
            sortable: true,
            width: 76,
            render: (val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            width: 78,
            render: (val) => <StatusBadge status={val} />
          }
        ]}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'refunded', label: 'Refunded' }
            ]
          }
        ]}
        rowActions={(row) => [
          { label: 'View payment details', onClick: () => navigate(`/payments/${row.id}`) }
        ]}
      />

      {/* ── Bottom row: account status + quick actions ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Account & payouts */}
        <div className="bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f3f4f6] dark:border-white/10">
            <p className="text-[13px] font-bold text-[#111827] dark:text-white">Account &amp; payouts</p>
            <button className="text-[12px] font-semibold text-[#374151] dark:text-gray-300 border border-[#e5e7eb] dark:border-white/10 rounded-md px-3 py-1.5 hover:bg-[#f9fafb] dark:hover:bg-white/10 cursor-pointer transition-colors">
              Manage
            </button>
          </div>
          <div className="px-4 py-3.5">
            {d.verificationStatus !== 'verified' && (
              <div className="flex items-start gap-2.5 bg-[#fffbeb] border border-[#fcd34d] rounded-md p-3 mb-3">
                <AlertTriangle className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#92400e] leading-snug">
                  <span className="font-bold">Action required:</span> Complete identity verification to enable payouts and live payments.
                </p>
              </div>
            )}
            {[
              ['Payments', <span className="flex items-center gap-1.5 text-[#059669] font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Active (test)</span>],
              ['Payouts', <span className="flex items-center gap-1.5 text-[#d97706] font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> Restricted</span>],
              ['Payout schedule', <span className="font-semibold text-[#111827] dark:text-white">2 business days</span>],
              ['Next payout', <span className="font-semibold text-[#111827] dark:text-white">—</span>],
              ['Bank account', <span className="font-semibold text-[#111827] dark:text-white">Not connected</span>],
            ].map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] dark:border-white/5 last:border-0">
                <span className="text-[12.5px] text-[#6b7280] dark:text-gray-400">{key}</span>
                <span className="text-[12.5px]">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#f3f4f6] dark:border-white/10">
            <p className="text-[13px] font-bold text-[#111827] dark:text-white">Quick actions</p>
          </div>
          <div className="px-2.5 py-2.5">
            {QUICK_ACTIONS.map(({ icon: Icon, label, sub, bg, ic }) => (
              <button
                key={label}
                className="flex items-center gap-3 w-full px-2.5 py-2 rounded-md hover:bg-[#f9fafb] dark:hover:bg-white/5 transition-colors group text-left cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon className="w-4 h-4" style={{ color: ic }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#111827] dark:text-white group-hover:text-[#1d4ed8] transition-colors">{label}</p>
                  <p className="text-[11px] text-[#9ca3af]">{sub}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#d1d5db] group-hover:text-[#1d4ed8] transition-colors" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}