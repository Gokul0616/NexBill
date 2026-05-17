import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { useMessage } from '../../context/MessageContext';
import { Trash2, Plus, RefreshCw, Lock } from 'lucide-react';
import { getCustomerFields, saveCustomerFields, resetCustomerFields } from '../../lib/customerFields';
import Dropdown from '../../components/Dropdown';

const SECTIONS = [
  { id: 'general', label: 'Business profile' },
  { id: 'branding', label: 'Branding' },
  { id: 'payments', label: 'Payments & payouts' },
  { id: 'billing', label: 'Billing & plans' },
  { id: 'team', label: 'Team' },
  { id: 'customer_portal', label: 'Customer portal' },
  { id: 'developers', label: 'Developers' },
];

function FocusInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full text-[14px] px-3 py-[7px] rounded-md border bg-white dark:bg-[#0a0a0a] border-[#c4cdd6] dark:border-white/10 text-[#0a2540] dark:text-white outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all ${className}`}
    />
  );
}

function FocusSelect({ className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full text-[14px] px-3 py-[7px] rounded-md border bg-white dark:bg-[#0a0a0a] border-[#c4cdd6] dark:border-white/10 text-[#0a2540] dark:text-white outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] cursor-pointer transition-all ${className}`}
    >
      {children}
    </select>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-7">
      <span className="text-[11px] font-semibold tracking-wider uppercase text-[#697386] dark:text-gray-500 whitespace-nowrap">{label}</span>
      <hr className="flex-1 border-none border-t border-[#e3e8ef] dark:border-white/10" />
    </div>
  );
}

function SaveBar({ message = "Changes are saved to your workspace." }) {
  return (
    <div className="px-6 py-4 border-t border-[#f0f2f5] dark:border-white/5 bg-[#fafbfc] dark:bg-[#1a1a1a] flex justify-end items-center gap-2">
      <span className="text-[12px] text-[#697386] dark:text-gray-500 mr-auto">{message}</span>
      <button className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Cancel</button>
      <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors">Save changes</button>
    </div>
  );
}

/* ═══════════════════════════════ SECTIONS ═══════════════════════════════ */

function GeneralSection() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Business details */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Business profile</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Basic information about your organization.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Company name</label>
              <FocusInput type="text" defaultValue="NexBill Inc" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Business email</label>
              <FocusInput type="email" defaultValue="billing@nexbill.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Business type</label>
              <FocusSelect>
                <option>SaaS / Software</option>
                <option>E-commerce</option>
                <option>Agency / Consulting</option>
                <option>Marketplace</option>
              </FocusSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Website URL</label>
              <FocusInput type="url" defaultValue="https://nexbill.com" />
            </div>
          </div>

          <SectionDivider label="Address" />

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Street address</label>
              <FocusInput type="text" defaultValue="123 Market Street" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">City</label>
              <FocusInput type="text" defaultValue="San Francisco" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">State / Province</label>
              <FocusInput type="text" defaultValue="CA" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 mt-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">ZIP / Postal code</label>
              <FocusInput type="text" defaultValue="94103" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Country</label>
              <FocusSelect>
                <option>United States</option>
                <option>India</option>
                <option>United Kingdom</option>
                <option>Canada</option>
              </FocusSelect>
            </div>
          </div>
        </div>
        <SaveBar />
      </div>

      {/* Tax info */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Tax information</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Tax IDs appear on invoices and receipts sent to your customers.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Tax ID type</label>
              <FocusSelect>
                <option>US EIN</option>
                <option>EU VAT</option>
                <option>IN GST</option>
              </FocusSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Tax ID number</label>
              <FocusInput type="text" placeholder="12-3456789" />
            </div>
          </div>
        </div>
        <SaveBar />
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-[#111] border border-[#fcc9c9] dark:border-red-500/20 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#fcc9c9] dark:border-red-500/20">
          <p className="text-[15px] font-semibold text-[#c0392b] dark:text-red-400 mb-0.5">Danger zone</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Irreversible and destructive actions.</p>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[14px] font-medium text-[#0a2540] dark:text-white mb-0.5">Delete workspace</p>
              <p className="text-[13px] text-[#697386] dark:text-gray-400">Permanently delete your workspace and all its data. This cannot be undone.</p>
            </div>
            <button className="px-4 py-1.5 text-[14px] text-[#c0392b] dark:text-red-400 bg-white dark:bg-white/5 border border-[#fcc9c9] dark:border-red-500/20 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-6 shrink-0">
              Delete workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandingSection() {
  const [color, setColor] = useState('#5469d4');
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Brand identity</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Customize how your brand appears to customers on invoices, emails, and payment pages.</p>
        </div>
        <div className="p-6">
          {/* Logo */}
          <div className="mb-7">
            <p className="text-[12px] font-medium text-[#425466] dark:text-gray-400 mb-2.5 block">Workspace logo</p>
            <div className="flex items-start gap-4">
              <div className="w-[72px] h-[72px] rounded-lg border-1.5 border-dashed border-[#c4cdd6] dark:border-white/10 bg-[#f6f9fc] dark:bg-white/5 flex flex-col items-center justify-center cursor-pointer gap-1 shrink-0 hover:border-[#5469d4] transition-colors group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#97a4b4] group-hover:text-[#5469d4] transition-colors" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span className="text-[10px] text-[#97a4b4] font-semibold uppercase group-hover:text-[#5469d4] transition-colors">Upload</span>
              </div>
              <div>
                <p className="text-[13px] text-[#425466] dark:text-gray-300 mb-1">PNG, JPG, or SVG. Recommended size 512 × 512px.</p>
                <p className="text-[13px] text-[#697386] dark:text-gray-500">Max file size: 2MB.</p>
              </div>
            </div>
          </div>

          <hr className="border-none border-t border-[#f0f2f5] dark:border-white/5 my-7" />

          {/* Icon */}
          <div className="mb-7">
            <p className="text-[12px] font-medium text-[#425466] dark:text-gray-400 mb-1 block">Brand icon</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-500 mb-2.5">Displayed in tab icons and notifications.</p>
            <div className="w-[72px] h-[72px] rounded-lg border-1.5 border-dashed border-[#c4cdd6] dark:border-white/10 bg-[#f6f9fc] dark:bg-white/5 flex flex-col items-center justify-center cursor-pointer gap-1 hover:border-[#5469d4] transition-colors group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#97a4b4] group-hover:text-[#5469d4] transition-colors" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <span className="text-[10px] text-[#97a4b4] font-semibold uppercase group-hover:text-[#5469d4] transition-colors">Upload</span>
            </div>
          </div>

          <hr className="border-none border-t border-[#f0f2f5] dark:border-white/5 my-7" />

          {/* Color */}
          <div>
            <p className="text-[12px] font-medium text-[#425466] dark:text-gray-400 mb-1 block">Accent color</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-500 mb-3">Used for buttons and highlights on customer-facing pages.</p>
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <div className="w-9 h-9 rounded-md border border-black/10 cursor-pointer shadow-sm transition-transform hover:scale-105 active:scale-95" style={{ background: color }} />
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
              <FocusInput className="w-[110px] font-mono text-[13px]"
                value={color.toUpperCase()} onChange={e => setColor(e.target.value)} />
              <div className="flex gap-1.5">
                {['#5469d4', '#00a67e', '#e36209', '#c0392b', '#8e44ad'].map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-sm transition-all ${color === c ? 'ring-2 ring-[#0a2540] dark:ring-white scale-110 shadow-md' : 'border border-transparent hover:scale-110'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <SaveBar />
      </div>

      {/* Preview card */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Preview</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">How your brand will appear on customer-facing pages.</p>
        </div>
        <div className="p-6 bg-[#f6f9fc] dark:bg-[#0a0a0a] flex justify-center">
          <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg p-8 w-[320px] shadow-lg">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ background: color }}>N</div>
              <span className="text-[15px] font-semibold text-[#0a2540] dark:text-white">NexBill Inc</span>
            </div>
            <p className="text-[13px] text-[#697386] dark:text-gray-400 mb-5">Complete your payment</p>
            <div className="border border-[#e3e8ef] dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#c4cdd6] dark:text-gray-600 mb-3 bg-white dark:bg-[#0a0a0a]">Card number</div>
            <button className="w-full text-white border-none rounded-md py-2.5 text-[14px] font-medium cursor-pointer transition-all hover:brightness-110 shadow-md active:scale-[0.98]" style={{ background: color }}>
              Pay $49.00
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsSection() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Payout accounts */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Bank accounts</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-400">Manage where your payouts are sent.</p>
          </div>
          <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors">Add bank account</button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 border border-[#e3e8ef] dark:border-white/10 rounded-lg bg-[#fafbfc] dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#e3e8ef] dark:border-white/10 flex items-center justify-center text-[#5469d4]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M13 10v11M17 10v11M2 5l10-3 10 3" /></svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0a2540] dark:text-white">CHASE BANK ···· 8829</p>
                <p className="text-[12px] text-[#697386] dark:text-gray-400 uppercase tracking-wider">Default Payout Account · USD</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#0e6027] dark:text-[#a3e635] bg-[#d7f7c2] dark:bg-[#0e6027]/20 px-2 py-0.5 rounded uppercase">Verified</span>
              <button className="p-1.5 text-[#697386] hover:text-[#0a2540] dark:hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payout schedule */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Payout schedule</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Choose when you receive your funds.</p>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <FocusSelect className="w-[200px]">
              <option>Daily automatic</option>
              <option>Weekly (Mondays)</option>
              <option>Monthly (1st)</option>
              <option>Manual only</option>
            </FocusSelect>
            <p className="text-[13px] text-[#697386] dark:text-gray-400 italic">Next payout estimated for tomorrow, May 17.</p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#f0f2ff] dark:bg-[#5469d4]/10 rounded-md border border-[#5469d4]/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5469d4" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p className="text-[12px] text-[#5469d4] font-medium">Payouts are subject to a 2-day rolling delay for security.</p>
          </div>
        </div>
        <SaveBar />
      </div>

      {/* Payment methods */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Payment methods</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Enable or disable payment methods for your customers.</p>
        </div>
        <div className="divide-y divide-[#f0f2f5] dark:divide-white/5">
          {[
            { id: 'cards', label: 'Cards', desc: 'Visa, Mastercard, Amex, Discover', enabled: true },
            { id: 'apple_pay', label: 'Apple Pay', desc: 'One-touch checkout on Apple devices', enabled: true },
            { id: 'google_pay', label: 'Google Pay', desc: 'Fast checkout for Android and Chrome users', enabled: true },
            { id: 'ach', label: 'ACH Direct Debit', desc: 'Direct bank transfers for US customers', enabled: false },
            { id: 'klarna', label: 'Klarna', desc: 'Buy now, pay later options', enabled: false },
          ].map(m => (
            <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors group">
              <div>
                <p className="text-[14px] font-semibold text-[#0a2540] dark:text-white mb-0.5">{m.label}</p>
                <p className="text-[12px] text-[#697386] dark:text-gray-400">{m.desc}</p>
              </div>
              <div className="flex items-center gap-4">
                {!m.enabled && <span className="text-[10px] font-bold text-[#697386] bg-[#f0f2f5] dark:bg-white/10 px-1.5 py-0.5 rounded uppercase opacity-0 group-hover:opacity-100 transition-opacity">Preview</span>}
                <div className={`w-9 h-5 rounded-full p-1 cursor-pointer transition-all ${m.enabled ? 'bg-[#5469d4]' : 'bg-[#e3e8ef] dark:bg-white/10'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-all ${m.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  const badgeClass = (color) => `inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${color === 'green'
    ? 'bg-[#d7f7c2] dark:bg-[#0e6027]/20 text-[#0e6027] dark:text-[#a3e635]'
    : 'bg-[#fff3cd] dark:bg-[#7d5a00]/20 text-[#7d5a00] dark:text-[#fbbf24]'
    }`;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Current plan */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Current plan</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Manage your subscription and billing.</p>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[16px] font-semibold text-[#0a2540] dark:text-white">Pro plan</span>
                <span className={badgeClass('green')}>Active</span>
              </div>
              <p className="text-[13px] text-[#697386] dark:text-gray-400 mb-1">$49 / month · Renews on June 1, 2026</p>
              <p className="text-[13px] text-[#697386] dark:text-gray-400">Up to 10 team members · Unlimited invoices</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Cancel plan</button>
              <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors shadow-sm shadow-[#5469d4]/20">Upgrade</button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Usage (NexBill Revenue Source) */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Platform usage</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">NexBill usage fees based on your processed volume.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="text-[12px] font-medium text-[#697386] dark:text-gray-500 uppercase tracking-wider mb-1.5">Total volume (May)</p>
              <p className="text-[24px] font-bold text-[#0a2540] dark:text-white">$42,850.00</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#697386] dark:text-gray-500 uppercase tracking-wider mb-1.5">Platform fees (0.5%)</p>
              <p className="text-[24px] font-bold text-[#5469d4]">$214.25</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#425466] dark:text-gray-400">Monthly transaction limit</span>
              <span className="font-medium text-[#0a2540] dark:text-white">8,450 / 10,000 tx</span>
            </div>
            <div className="w-full h-2 bg-[#f0f2f5] dark:bg-white/5 rounded-full overflow-hidden border border-[#e3e8ef] dark:border-white/5">
              <div className="h-full bg-[#5469d4] rounded-full transition-all duration-1000" style={{ width: '84.5%' }} />
            </div>
            <p className="text-[11px] text-[#697386] dark:text-gray-500 italic mt-1">You are approaching your transaction limit. Consider upgrading for unlimited processing.</p>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Payment method</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Used for subscription billing.</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-7 rounded bg-[#1a1f71] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-[10px] font-bold tracking-widest">VISA</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#0a2540] dark:text-white mb-0.5">•••• •••• •••• 4242</p>
                <p className="text-[12px] text-[#697386] dark:text-gray-400">Expires 12/27</p>
              </div>
            </div>
            <button className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Update</button>
          </div>
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Billing history</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Download past invoices for your records.</p>
        </div>
        <div className="divide-y divide-[#f0f2f5] dark:divide-white/5">
          {[
            { date: 'May 1, 2026', amount: '$49.00', status: 'Paid' },
            { date: 'Apr 1, 2026', amount: '$49.00', status: 'Paid' },
            { date: 'Mar 1, 2026', amount: '$49.00', status: 'Paid' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors">
              <span className="text-[13px] text-[#425466] dark:text-gray-300 w-1/3">{inv.date}</span>
              <span className="text-[13px] font-medium text-[#0a2540] dark:text-white w-1/4">{inv.amount}</span>
              <span className="w-1/4"><span className={badgeClass('green')}>{inv.status}</span></span>
              <button className="px-3 py-1 text-[12px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Download PDF</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamSection() {
  const members = [
    { name: 'Alice Chen', email: 'alice@nexbill.com', role: 'Owner', initials: 'AC', color: '#5469d4' },
    { name: 'Bob Kumar', email: 'bob@nexbill.com', role: 'Administrator', initials: 'BK', color: '#00a67e' },
    { name: 'Sam Taylor', email: 'sam@nexbill.com', role: 'Developer', initials: 'ST', color: '#e36209' },
  ];
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10 flex justify-between items-start">
          <div>
            <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Team members</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-400">Manage who has access to your workspace.</p>
          </div>
          <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors shadow-sm shadow-[#5469d4]/20">Invite member</button>
        </div>
        <div className="divide-y divide-[#f0f2f5] dark:divide-white/5">
          {members.map((m, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm"
                  style={{ background: m.color + '20', color: m.color }}
                >
                  {m.initials}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0a2540] dark:text-white mb-0.5">{m.name}</p>
                  <p className="text-[12px] text-[#697386] dark:text-gray-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FocusSelect className="w-auto text-[12px] px-2 py-1">
                  <option>{m.role}</option>
                  <option>Administrator</option>
                  <option>Developer</option>
                  <option>View only</option>
                </FocusSelect>
                {m.role !== 'Owner' && <button className="px-2.5 py-1 text-[12px] text-[#c0392b] dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Remove</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite link */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Invite link</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Share this link to let people request access to your workspace.</p>
        </div>
        <div className="p-6 flex gap-2">
          <FocusInput className="flex-1 text-[#697386] dark:text-gray-400 text-[13px] bg-[#f6f9fc] dark:bg-[#0a0a0a]" defaultValue="https://app.nexbill.com/invite/wsp_xyz_abc123" readOnly />
          <button className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Copy</button>
          <button className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Regenerate</button>
        </div>
      </div>
    </div>
  );
}

function DevelopersSection() {
  const [showKeys, setShowKeys] = useState(false);
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* API Keys */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">API Keys</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-400">Use these keys to authenticate requests to the NexBill API.</p>
          </div>
          <button onClick={() => setShowKeys(!showKeys)} className="px-4 py-1.5 text-[14px] font-medium text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">
            {showKeys ? 'Hide keys' : 'Show keys'}
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400 uppercase tracking-wider">Publishable key</label>
              <span className="text-[11px] text-[#0e6027] dark:text-[#a3e635] font-bold uppercase">Public</span>
            </div>
            <div className="flex gap-2">
              <FocusInput className="font-mono text-[13px] bg-[#f6f9fc] dark:bg-[#0a0a0a]" value="pk_test_51Mz7xZNexBill4242..." readOnly />
              <button className="p-2 text-[#697386] hover:text-[#5469d4] transition-colors border border-[#e3e8ef] dark:border-white/10 rounded-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400 uppercase tracking-wider">Secret key</label>
              <span className="text-[11px] text-[#c0392b] dark:text-red-400 font-bold uppercase">Restricted</span>
            </div>
            <div className="flex gap-2">
              <FocusInput type={showKeys ? 'text' : 'password'} className="font-mono text-[13px] bg-[#f6f9fc] dark:bg-[#0a0a0a]" value="sk_test_51Mz7xZSecretKey99..." readOnly />
              <button className="p-2 text-[#697386] hover:text-[#5469d4] transition-colors border border-[#e3e8ef] dark:border-white/10 rounded-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/5 rounded-md border border-red-100 dark:border-red-500/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <p className="text-[12px] text-[#c0392b] font-medium">Never share your secret key or include it in client-side code.</p>
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Webhooks</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-400">NexBill sends events to your server using webhooks.</p>
          </div>
          <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors shadow-sm shadow-[#5469d4]/20">Add endpoint</button>
        </div>
        <div className="p-6 text-center py-12">
          <div className="w-16 h-16 bg-[#f6f9fc] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#97a4b4]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 17l6-6-6-6M12 19h8" /></svg>
          </div>
          <p className="text-[14px] font-semibold text-[#0a2540] dark:text-white mb-1">No endpoints registered</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400 mb-6 max-w-sm mx-auto">Start listening to events like successful payments or subscription updates by adding your first endpoint.</p>
          <button className="text-[13px] font-semibold text-[#5469d4] hover:text-[#4a5fc1] transition-colors underline-offset-4 hover:underline">Read the webhook documentation</button>
        </div>
      </div>
    </div>
  );
}

function CustomerPortalSection() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Portal features */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Customer portal settings</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Control what your customers can do in their self-service portal.</p>
        </div>
        <div className="divide-y divide-[#f0f2f5] dark:divide-white/5">
          {[
            { label: 'Allow cancellations', desc: 'Customers can cancel their subscriptions at the end of the period.', enabled: true },
            { label: 'Allow plan switching', desc: 'Customers can upgrade or downgrade their current plan.', enabled: true },
            { label: 'Allow payment updates', desc: 'Customers can update their payment methods and billing address.', enabled: true },
            { label: 'Show billing history', desc: 'Customers can view and download their past invoices.', enabled: true },
          ].map((item, i) => (
            <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors">
              <div className="max-w-md">
                <p className="text-[14px] font-semibold text-[#0a2540] dark:text-white mb-0.5">{item.label}</p>
                <p className="text-[12px] text-[#697386] dark:text-gray-400">{item.desc}</p>
              </div>
              <div className={`w-9 h-5 rounded-full p-1 cursor-pointer transition-all ${item.enabled ? 'bg-[#5469d4]' : 'bg-[#e3e8ef] dark:bg-white/10'}`}>
                <div className={`w-3 h-3 bg-white rounded-full transition-all ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
        <SaveBar />
      </div>

      {/* Policies */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Legal & Policies</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">These links will be shown on your checkout and portal pages.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Terms of service URL</label>
            <FocusInput placeholder="https://nexbill.com/terms" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Privacy policy URL</label>
            <FocusInput placeholder="https://nexbill.com/privacy" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Refund policy URL</label>
            <FocusInput placeholder="https://nexbill.com/refunds" />
          </div>
        </div>
        <SaveBar />
      </div>

      <CustomerFieldsSection />
    </div>
  );
}

function CustomerFieldsSection() {
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', key: '', type: 'text', placeholder: '', required: false });
  const { showMessage } = useMessage();

  useEffect(() => {
    setFields(getCustomerFields());
  }, []);

  const handleToggle = (key) => {
    setFields(prev => prev.map(f => {
      if (f.key === key) {
        if (f.key === 'name' || f.key === 'email') return f; // Locked
        return { ...f, enabled: !f.enabled };
      }
      return f;
    }));
  };

  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!newField.label) {
      showMessage('Field label is required', 'error');
      return;
    }
    
    // Automatically derive key from label/field name
    const key = newField.label.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    // Check if key is a protected database column in the backend
    const PROTECTED_COLUMNS = ['id', 'name', 'email', 'phone', 'gst_number', 'metadata', 'created_at'];
    if (PROTECTED_COLUMNS.includes(key)) {
      showMessage(`Field "${newField.label}" is a protected database column in the backend. Please use a different field name.`, 'error');
      return;
    }

    if (fields.some(f => f.key === key)) {
      showMessage(`Field "${newField.label}" already exists.`, 'error');
      return;
    }

    const fieldToAdd = {
      key,
      label: newField.label,
      type: newField.type,
      placeholder: newField.placeholder || `Enter ${newField.label}`,
      required: newField.required,
      enabled: true,
      isCustom: true
    };

    setFields(prev => [...prev, fieldToAdd]);
    setNewField({ label: '', key: '', type: 'text', placeholder: '', required: false });
    showMessage('Custom field added. Click "Save changes" to apply.', 'info');
  };

  const handleDeleteCustomField = (key) => {
    setFields(prev => prev.filter(f => f.key !== key));
    showMessage('Custom field removed. Click "Save changes" to apply.', 'info');
  };

  const handleSave = () => {
    saveCustomerFields(fields);
    showMessage('Customer fields configuration saved successfully!', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset customer fields to defaults? Any custom fields will be removed.')) {
      const defaulted = resetCustomerFields();
      setFields(defaulted);
      showMessage('Customer fields reset to defaults.', 'success');
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Configure Fields */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Customer database fields</p>
            <p className="text-[13px] text-[#697386] dark:text-gray-400">Configure standard fields or define custom variables that flow into customer forms and table views.</p>
          </div>
          <button 
            type="button" 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-300 dark:border-white/10 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset defaults
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e3e8ef] dark:border-white/10 text-[#697386] font-medium">
                <th className="pb-3 w-1/3">Field Name</th>
                <th className="pb-3 w-1/4">Key</th>
                <th className="pb-3 w-1/6">Type</th>
                <th className="pb-3 w-1/6">Required</th>
                <th className="pb-3 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f5] dark:divide-white/5">
              {fields.map(f => (
                <tr key={f.key} className="hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-[#0a2540] dark:text-white">
                    {f.label}
                    {f.isCustom && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-normal">Custom</span>}
                  </td>
                  <td className="py-3 font-mono text-[12px] text-[#697386] dark:text-gray-400">{f.key}</td>
                  <td className="py-3 capitalize text-[#697386] dark:text-gray-400">{f.type}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${f.required ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'}`}>
                      {f.required ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {f.key === 'name' || f.key === 'email' ? (
                        <div className="text-gray-400 p-1 flex items-center gap-1 text-[11px]">
                          <Lock className="w-3 h-3" /> Locked
                        </div>
                      ) : (
                        <>
                          <div 
                            onClick={() => handleToggle(f.key)}
                            className={`w-9 h-5 rounded-full p-1 cursor-pointer transition-all ${f.enabled ? 'bg-[#5469d4]' : 'bg-[#e3e8ef] dark:bg-white/10'}`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${f.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                          {f.isCustom && (
                            <button 
                              type="button" 
                              onClick={() => handleDeleteCustomField(f.key)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Custom SaveBar integration for Fields */}
        <div className="px-6 py-4 border-t border-[#f0f2f5] dark:border-white/5 bg-[#fafbfc] dark:bg-[#1a1a1a] flex justify-end items-center gap-2">
          <span className="text-[12px] text-[#697386] dark:text-gray-500 mr-auto">Save the table state to compile the custom database fields.</span>
          <button 
            type="button" 
            onClick={() => setFields(getCustomerFields())}
            className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors"
          >
            Discard
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>

      {/* Add Custom Field */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Add custom schema field</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Instantiate new dynamic columns to customize client profiles.</p>
        </div>
        <form onSubmit={handleAddCustomField} className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Field Label</label>
            <FocusInput 
              required
              type="text" 
              placeholder="e.g. Company Name" 
              value={newField.label}
              onChange={e => setNewField(prev => ({ ...prev, label: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Field Type</label>
              <Dropdown 
                value={newField.type}
                onChange={val => setNewField(prev => ({ ...prev, type: val }))}
                options={[
                  { value: 'text', label: 'Text (Standard)' },
                  { value: 'number', label: 'Number' },
                  { value: 'email', label: 'Email' },
                  { value: 'website', label: 'Website' },
                ]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Placeholder Text (Optional)</label>
              <FocusInput 
                type="text" 
                placeholder="e.g. Enter company name" 
                value={newField.placeholder}
                onChange={e => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="field_required" 
              className="rounded border-[#c4cdd6] text-[#5469d4] focus:ring-[#5469d4]"
              checked={newField.required}
              onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
            />
            <label htmlFor="field_required" className="text-[13px] font-medium text-[#425466] dark:text-gray-300 cursor-pointer">
              Mark this field as mandatory/required
            </label>
          </div>
          <div className="flex justify-end pt-3">
            <button 
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-medium rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Add field to queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ ROOT ═══════════════════════════════ */

export default function WorkspaceSettings() {
  const location = useLocation?.() ?? { search: '' };
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && SECTIONS.find(s => s.id === tab)) setActiveSection(tab);
  }, [location]);

  const SECTION_MAP = {
    general: <GeneralSection />,
    branding: <BrandingSection />,
    payments: <PaymentsSection />,
    billing: <BillingSection />,
    team: <TeamSection />,
    customer_portal: <CustomerPortalSection />,
    developers: <DevelopersSection />,
  };

  return (
    <div className="bg-[#f6f9fc] dark:bg-[#0a0a0a] font-sans text-[#0a2540] dark:text-white pb-20">
      <div className="mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-[22px] font-bold text-[#0a2540] dark:text-white mb-1 tracking-tight">Workspace settings</h1>
            <p className="text-[13px] text-[#697386] dark:text-gray-400">Manage your company profile, branding, and billing preferences.</p>
          </div>
        </div>

        <div className="flex gap-0 items-start">
          <aside className="w-[220px] shrink-0 pr-8">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#697386] dark:text-gray-500 px-3 mb-3">Settings</p>
            <nav className="flex flex-col gap-0.5">
              {SECTIONS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`block w-full text-left px-3 py-[7px] text-[14px] rounded-r-md transition-all border-l-2 cursor-pointer ${activeSection === item.id
                    ? 'font-bold text-[#5469d4] bg-[#f0f2ff] dark:bg-[#5469d4]/10 border-[#5469d4]'
                    : 'text-[#425466] dark:text-gray-400 border-transparent hover:text-[#5469d4] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {SECTION_MAP[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
}