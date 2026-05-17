import { Users, CreditCard, FileText, Repeat, ArrowUpRight, ArrowDownRight, Plus, ChevronDown, MoreHorizontal, Loader2, Shield, CheckCircle, ChevronRight } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../config/api';

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#5469d4', positive = true }) {
  const values = data.length > 1 ? data : [0, 0];
  const w = 120, h = 36, pad = 2;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `M${pts[0]} L${pts.slice(1).join(' L')} L${w - pad},${h} L${pad},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace('#', '')})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div className="flex items-end gap-[3px] h-24 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-sm bg-[#e6e9f0] dark:bg-[#222] group-hover:bg-[#5469d4] transition-colors"
            style={{ height: `${Math.max(4, (d.v / max) * 88)}px` }}
            title={`$${d.v.toLocaleString()}`}
          />
        </div>
      ))}
    </div>
  );
}

const statusStyle = {
  paid: 'bg-[#d4edda] text-[#1a6430] dark:bg-green-900/30 dark:text-green-400',
  refunded: 'bg-[#fff3cd] text-[#856404] dark:bg-yellow-900/30 dark:text-yellow-400',
  unpaid: 'bg-[#f8d7da] text-[#721c24] dark:bg-red-900/30 dark:text-red-400',
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, change, spark, color }) {
  const up = change.startsWith('+');
  return (
    <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[#697386] dark:text-gray-400 font-medium">{title}</span>
        <span className={`flex items-center gap-0.5 text-[12px] font-semibold ${up ? 'text-[#1a6430] dark:text-green-400' : 'text-[#9e2a2b] dark:text-red-400'}`}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {change}
        </span>
      </div>
      <div className="text-[22px] font-bold text-[#1a1f36] dark:text-white tracking-tight leading-none">
        {value}
      </div>
      <Sparkline data={spark} color={color} positive={up} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { testMode } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/invoices/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5469d4]" />
      </div>
    );
  }

  const data = stats || { totalMRR: 0, pendingInvoices: 0, recentPayments: [], isActivated: false, verificationStatus: 'pending' };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans animate-in fade-in duration-500">


      {/* ── Page header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-bold text-[#1a1f36] dark:text-white tracking-tight">Home</h1>
            {testMode && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fff3cd] text-[#856404] px-1.5 py-0.5 rounded border border-[#ffeeba]">Test Mode</span>
            )}
          </div>
          <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-medium rounded-md transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total volume" value={`$${data.totalMRR.toLocaleString()}`} change="+0%" spark={[0, 0, 0, data.totalMRR]} color="#5469d4" />
        <StatCard title="Pending invoices" value={data.pendingInvoices} change="+0%" spark={[0, 0, data.pendingInvoices]} color="#e5484d" />
        <StatCard title="Total customers" value="--" change="+0%" spark={[0, 0]} color="#1a9c6a" />
        <StatCard title="Net revenue" value={`$${data.totalMRR.toLocaleString()}`} change="+0%" spark={[0, 0, 0, data.totalMRR]} color="#5469d4" />
      </div>

      {/* ── Revenue chart + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[13px] text-[#697386] dark:text-gray-400 font-medium">Gross volume</p>
              <p className="text-[22px] font-bold text-[#1a1f36] dark:text-white tracking-tight mt-0.5">${data.totalMRR.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[#697386] dark:text-gray-400 border border-[#e3e8ee] dark:border-white/10 rounded-md px-2 py-1 cursor-pointer hover:bg-[#f6f9fc] dark:hover:bg-white/5">
              Current month <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <BarChart data={[{ v: data.totalMRR }]} />
        </div>

        <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#1a1f36] dark:text-white mb-1">Quick actions</p>
          {[
            { icon: Users, label: 'Add customer', sub: 'Create a new profile' },
            { icon: Repeat, label: 'New subscription', sub: 'Enroll into a plan' },
            { icon: FileText, label: 'Generate invoice', sub: 'One-off or recurring' },
            { icon: CreditCard, label: 'Create plan', sub: 'Set up pricing tier' },
          ].map(({ icon: Icon, label, sub }) => (
            <button key={label} className="flex items-center gap-3 px-2.5 py-2 w-full text-left rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#f6f9fc] dark:bg-white/5 border border-[#e3e8ee] dark:border-white/10 flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#697386] dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#3c4257] dark:text-gray-200 group-hover:text-[#5469d4] transition-colors leading-tight">{label}</p>
                <p className="text-[11px] text-[#a3acb9] dark:text-gray-500 leading-tight">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent transactions ── */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] dark:border-white/10">
          <p className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">Recent payments</p>
          <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium transition-colors">View all →</button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e3e8ee] dark:border-white/10 bg-[#fafbfc] dark:bg-white/2">
              {['Amount', 'Customer', 'Date', 'Status', ''].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recentPayments.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-[13px] text-[#697386]">No recent payments found.</td></tr>
            ) : data.recentPayments.map((tx, i) => (
              <tr key={i} className="border-b border-[#f6f9fc] dark:border-white/5 last:border-0 hover:bg-[#f6f9fc] dark:hover:bg-white/3 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-[13px] font-bold text-[#1a1f36] dark:text-white whitespace-nowrap">${parseFloat(tx.amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-[#3c4257] dark:text-gray-200 font-medium leading-tight">{tx.customer_name}</p>
                  <p className="text-[11px] text-[#a3acb9] dark:text-gray-500">{tx.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400 whitespace-nowrap">
                  {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[tx.status] || statusStyle.unpaid}`}>
                    {tx.status === 'paid' && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 opacity-70" />}
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 text-[#a3acb9] hover:text-[#3c4257] dark:hover:text-gray-200 transition-colors rounded">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}