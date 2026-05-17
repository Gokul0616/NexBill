import React from 'react';
import { Users, RefreshCw, ChevronRight } from 'lucide-react';

export default function MerchantsTable({ 
  loading, 
  filteredMerchants, 
  selectedMerchant, 
  onSelectMerchant 
}) {

  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return { label: 'Verified', dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400' };
      case 'action_required':
        return { label: 'Action Required', dot: 'bg-rose-500', badge: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400' };
      default:
        return { label: 'Pending', dot: 'bg-amber-500', badge: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400' };
    }
  };

  return (
    <div className="bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden transition-all duration-200">
      
      {/* Table Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Merchant Applications</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
            {filteredMerchants.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500">Loading merchants...</p>
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="p-20 text-center">
          <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-zinc-700 dark:text-zinc-300 font-medium text-[14px]">No merchants found</h3>
          <p className="text-zinc-400 dark:text-zinc-500 text-[12px] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="px-5 py-3">Company / Representative</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Capabilities</th>
                <th className="px-5 py-3 text-right w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.map(merchant => {
                const status = getStatusConfig(merchant.verification_status);
                const isSelected = selectedMerchant?.id === merchant.id;
                const chargesOn = merchant.charges_enabled === true || merchant.charges_enabled === 'true' || merchant.charges_enabled === 't';
                const payoutsOn = merchant.payouts_enabled === true || merchant.payouts_enabled === 'true' || merchant.payouts_enabled === 't';
                
                return (
                  <tr 
                    key={merchant.id} 
                    onClick={() => onSelectMerchant(merchant)}
                    className={`border-b border-zinc-50 dark:border-zinc-800/50 transition-colors cursor-pointer text-[13px] ${
                      isSelected 
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/15' 
                        : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50 flex items-center justify-center text-[12px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
                          {(merchant.company || merchant.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 dark:text-white truncate">
                            {merchant.company || 'Unnamed Business'}
                          </div>
                          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                            {merchant.name || 'No representative'} · {merchant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          chargesOn
                            ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'
                        }`}>
                          CHG
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          payoutsOn
                            ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'
                        }`}>
                          PAY
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-indigo-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
