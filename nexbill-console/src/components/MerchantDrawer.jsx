import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import MerchantInspector from './MerchantInspector';

export default function MerchantDrawer({ isOpen, onClose, ...inspectorProps }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]" 
        style={{ animation: 'fadeIn 0.2s ease' }}
        onClick={onClose} 
      />
      {/* Drawer Panel */}
      <div className="absolute top-0 right-0 h-full w-full max-w-[540px] bg-white dark:bg-[#0e0f13] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col drawer-enter">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-zinc-100 dark:border-zinc-800/80 flex-shrink-0">
          <h2 className="text-[14px] font-semibold text-zinc-900 dark:text-white">Merchant Inspector</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Inspector Content - scrollable */}
        <div className="flex-1 overflow-hidden">
          <MerchantInspector {...inspectorProps} onClose={onClose} isDrawer={true} />
        </div>
      </div>
    </div>
  );
}
