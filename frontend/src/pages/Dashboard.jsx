import { Users, CreditCard, FileText, Repeat, ArrowUpRight, ArrowDownRight, Plus, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useEffect } from 'react';
import { useBanner } from '../context/BannerContext';


// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#5469d4', positive = true }) {
  const w = 120, h = 36, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
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
  const max = Math.max(...data.map(d => d.v));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const sparkMRR = [38000, 39500, 40200, 41000, 42100, 43000, 44100, 43800, 44600, 45230];
const sparkCust = [980, 1010, 1040, 1080, 1110, 1150, 1180, 1200, 1225, 1240];
const sparkSubs = [800, 818, 830, 845, 855, 862, 870, 878, 885, 892];
const sparkInv = [18, 22, 19, 26, 21, 28, 25, 30, 27, 24];

const barData = [
  { v: 32000 }, { v: 35000 }, { v: 29000 }, { v: 38000 },
  { v: 41000 }, { v: 37000 }, { v: 43000 }, { v: 39000 },
  { v: 44000 }, { v: 45230 }, { v: 42000 }, { v: 47000 },
];

const recentTransactions = [
  { name: 'Acme Corp', email: 'billing@acme.com', amount: '$299.00', status: 'Succeeded', date: 'May 16' },
  { name: 'Jane Diaz', email: 'jane@example.com', amount: '$9.99', status: 'Succeeded', date: 'May 16' },
  { name: 'TechFlow Inc', email: 'pay@techflow.io', amount: '$599.00', status: 'Succeeded', date: 'May 15' },
  { name: 'Solo Studio', email: 'hi@solo.studio', amount: '$49.00', status: 'Refunded', date: 'May 15' },
  { name: 'Bright Labs', email: 'ops@bright.dev', amount: '$199.00', status: 'Succeeded', date: 'May 14' },
];

const statusStyle = {
  Succeeded: 'bg-[#d4edda] text-[#1a6430] dark:bg-green-900/30 dark:text-green-400',
  Refunded: 'bg-[#fff3cd] text-[#856404] dark:bg-yellow-900/30 dark:text-yellow-400',
  Failed: 'bg-[#f8d7da] text-[#721c24] dark:bg-red-900/30 dark:text-red-400',
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
  return (

    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-[18px] font-bold text-[#1a1f36] dark:text-white tracking-tight">Home</h1>
          <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">May 16, 2026</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-medium rounded-md transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total customers" value="1,240" change="+12%" spark={sparkCust} color="#5469d4" />
        <StatCard title="Active subscriptions" value="892" change="+5%" spark={sparkSubs} color="#1a9c6a" />
        <StatCard title="Monthly recurring rev." value="$45,230" change="+8%" spark={sparkMRR} color="#5469d4" />
        <StatCard title="Pending invoices" value="24" change="-2%" spark={sparkInv} color="#e5484d" />
      </div>

      {/* ── Revenue chart + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[13px] text-[#697386] dark:text-gray-400 font-medium">Gross volume</p>
              <p className="text-[22px] font-bold text-[#1a1f36] dark:text-white tracking-tight mt-0.5">$45,230</p>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[#697386] dark:text-gray-400 border border-[#e3e8ee] dark:border-white/10 rounded-md px-2 py-1 cursor-pointer hover:bg-[#f6f9fc] dark:hover:bg-white/5">
              Last 12 months <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <p className="text-[12px] text-[#1a6430] dark:text-green-400 font-semibold flex items-center gap-0.5 mb-3">
            <ArrowUpRight className="w-3.5 h-3.5" /> +8% vs last period
          </p>
          <BarChart data={barData} />
          <div className="flex justify-between mt-1">
            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
              <span key={i} className="flex-1 text-center text-[10px] text-[#a3acb9] dark:text-gray-600">{m}</span>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg p-4 flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#1a1f36] dark:text-white mb-1">Quick actions</p>

          {[
            { icon: Users, label: 'Add customer', sub: 'Create a new profile' },
            { icon: Repeat, label: 'New subscription', sub: 'Enroll into a plan' },
            { icon: FileText, label: 'Generate invoice', sub: 'One-off or recurring' },
            { icon: CreditCard, label: 'Create plan', sub: 'Set up pricing tier' },
          ].map(({ icon: Icon, label, sub }) => (
            <button
              key={label}
              className="flex items-center gap-3 px-2.5 py-2 w-full text-left rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/5 transition-colors group cursor-pointer"
            >
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
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] dark:border-white/10">
          <p className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">Recent payments</p>
          <button className="text-[13px] text-[#5469d4] hover:text-[#4a5fc1] font-medium transition-colors">View all →</button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e3e8ee] dark:border-white/10">
              {['Amount', 'Description', 'Customer', 'Date', 'Status', ''].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx, i) => (
              <tr
                key={i}
                className="border-b border-[#f6f9fc] dark:border-white/5 last:border-0 hover:bg-[#f6f9fc] dark:hover:bg-white/3 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-[13px] font-semibold text-[#1a1f36] dark:text-white whitespace-nowrap">
                  {tx.amount}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400">
                  Subscription update
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-[#3c4257] dark:text-gray-200 font-medium leading-tight">{tx.name}</p>
                  <p className="text-[11px] text-[#a3acb9] dark:text-gray-500">{tx.email}</p>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400 whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[tx.status]}`}>
                    {tx.status === 'Succeeded' && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 opacity-70" />}
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