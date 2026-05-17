import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Toast({ notification }) {
  if (!notification) return null;
  return (
    <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-4 py-3 rounded-[6px] shadow-2xl border transition-all duration-300 ${
      notification.type === 'success' 
        ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
        : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
    }`}>
      {notification.type === 'success' ? (
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
      ) : (
        <ShieldAlert className="w-5 h-5 text-rose-400" />
      )}
      <span className="text-[13px] font-medium">{notification.message}</span>
    </div>
  );
}
