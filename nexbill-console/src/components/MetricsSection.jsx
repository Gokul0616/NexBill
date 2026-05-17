import React from 'react';
import { Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MetricsSection({ merchants }) {
  const totalCount = merchants.length;
  const pendingCount = merchants.filter(m => m.verification_status === 'pending').length;
  const verifiedCount = merchants.filter(m => m.verification_status === 'verified').length;
  const actionCount = merchants.filter(m => m.verification_status === 'action_required' || m.verification_status === 'restricted').length;

  const cards = [
    {
      label: 'Total Merchants',
      value: totalCount,
      icon: Users,
      accent: 'from-zinc-500/10 to-zinc-600/5',
      iconColor: 'text-zinc-500 dark:text-zinc-400',
      valueColor: 'text-zinc-900 dark:text-white',
      dotColor: 'bg-zinc-400',
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      accent: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-400',
    },
    {
      label: 'Verified & Active',
      value: verifiedCount,
      icon: CheckCircle2,
      accent: 'from-emerald-500/10 to-emerald-600/5',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
    {
      label: 'Action Required',
      value: actionCount,
      icon: AlertTriangle,
      accent: 'from-rose-500/10 to-rose-600/5',
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-600 dark:text-rose-400',
      dotColor: 'bg-rose-400',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-5 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
          >
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  {card.label}
                </p>
                <h3 className={`text-[28px] font-bold ${card.valueColor} tabular-nums tracking-tight leading-none`}>
                  {card.value}
                </h3>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center ${card.iconColor} transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
