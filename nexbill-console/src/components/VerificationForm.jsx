import React from 'react';
import { Key, Check, AlertTriangle, ShieldAlert, Ban, Megaphone, RefreshCw } from 'lucide-react';

export default function VerificationForm({
  vStatus, setVStatus,
  chargesEnabled, setChargesEnabled,
  payoutsEnabled, setPayoutsEnabled,
  currentlyDue, toggleDueField,
  comments, setComments,
  actionLoading, onSubmitDecision, onSaveSettingsOnly,
  isBlocked, setIsBlocked,
  paymentsBlocked, setPaymentsBlocked,
  customBannerMessage, setCustomBannerMessage
}) {

  const toggleCls = "w-[38px] h-[20px] rounded-full relative transition-colors duration-200 flex-shrink-0 cursor-pointer";
  const toggleDot = "absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200";
  const inputCls = "w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[12px] text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-zinc-400 dark:placeholder-zinc-600";

  return (
    <form onSubmit={onSubmitDecision} className="space-y-5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
        <Key className="w-3.5 h-3.5 text-indigo-500" /> Verification Decision
      </h4>

      {/* Decision Buttons */}
      <div className="flex gap-2">
        <button type="button"
          onClick={() => { setVStatus('verified'); setChargesEnabled(true); setPayoutsEnabled(true); }}
          className={`flex-1 py-2.5 px-3 border rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            vStatus === 'verified'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <Check className="w-4 h-4" /> Verify
        </button>
        <button type="button"
          onClick={() => { setVStatus('action_required'); setChargesEnabled(false); setPayoutsEnabled(false); }}
          className={`flex-1 py-2.5 px-3 border rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            vStatus === 'action_required'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Reject
        </button>
      </div>

      {/* Capabilities */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-3">
        <label className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Capabilities</label>
        {[
          { label: 'Charges Enabled', desc: 'Allow payments and checkout operations', checked: chargesEnabled, onChange: e => setChargesEnabled(e.target.checked), color: 'indigo' },
          { label: 'Payouts Enabled', desc: 'Allow settlements to merchant bank', checked: payoutsEnabled, onChange: e => setPayoutsEnabled(e.target.checked), color: 'indigo' },
        ].map((cap, i) => (
          <div key={cap.label} className={`flex items-center justify-between ${i > 0 ? 'pt-3 border-t border-zinc-50 dark:border-zinc-800/50' : ''}`}>
            <div>
              <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 block">{cap.label}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{cap.desc}</span>
            </div>
            <button type="button" onClick={() => cap.onChange({ target: { checked: !cap.checked } })}
              className={`${toggleCls} ${cap.checked ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <span className={`${toggleDot} ${cap.checked ? 'left-[18px]' : 'left-[2px]'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Risk Management */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-3">
        <label className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> Risk Management
        </label>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-500" /> Suspend Account
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">View-only mode, disable all writes</span>
          </div>
          <button type="button" onClick={() => setIsBlocked(!isBlocked)}
            className={`${toggleCls} ${isBlocked ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
            <span className={`${toggleDot} ${isBlocked ? 'left-[18px]' : 'left-[2px]'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
          <div>
            <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Block Live Payments
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Disable production checkouts</span>
          </div>
          <button type="button" onClick={() => setPaymentsBlocked(!paymentsBlocked)}
            className={`${toggleCls} ${paymentsBlocked ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
            <span className={`${toggleDot} ${paymentsBlocked ? 'left-[18px]' : 'left-[2px]'}`} />
          </button>
        </div>

        {/* Custom Banner Message */}
        <div className="pt-3 border-t border-zinc-50 dark:border-zinc-800/50 space-y-1.5">
          <label className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Custom Dashboard Message
          </label>
          <input type="text" placeholder="Optional alert text for merchant..." value={customBannerMessage || ''}
            onChange={e => setCustomBannerMessage(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Currently Due Fields */}
      {vStatus === 'action_required' && (
        <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-2">
          <label className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Required Fields</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { key: 'business_pan', label: 'Business PAN' },
              { key: 'gstin', label: 'GSTIN Proof' },
              { key: 'website_url', label: 'Website URL' },
              { key: 'rep_pan', label: 'Rep PAN Card' },
              { key: 'bank_details', label: 'Bank Account' },
              { key: 'refund_url', label: 'Refund Policy' }
            ].map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" checked={currentlyDue.includes(f.key)} onChange={() => toggleDueField(f.key)}
                  className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer" />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Review Comments</label>
        <textarea placeholder={vStatus === 'verified' ? 'Optional notes...' : 'Describe what needs correction...'}
          value={comments} onChange={e => setComments(e.target.value)}
          className={`${inputCls} min-h-[70px] resize-none`} />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button type="button" disabled={actionLoading} onClick={onSaveSettingsOnly}
          className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold py-2.5 rounded-xl text-[12px] flex items-center justify-center gap-2 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed">
          {actionLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Settings'}
        </button>
        <button type="submit" disabled={actionLoading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-[12px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {actionLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Applying...</> : 'Apply Decision'}
        </button>
      </div>
    </form>
  );
}
