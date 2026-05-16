import { useBanner } from '../context/BannerContext';
import { AlertTriangle, Info, CheckCircle, X, ExternalLink } from 'lucide-react';

const bannerStyles = {
  info: {
    bg: 'bg-[#5469d4]',
    text: 'text-white',
    icon: Info,
  },
  warning: {
    bg: 'bg-[#fffbeb] dark:bg-[#fefce8]/10',
    text: 'text-[#92400e] dark:text-[#fef08a]',
    border: 'border-b border-[#fde68a] dark:border-[#fef08a]/20',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-[#fef2f2] dark:bg-[#ef4444]/10',
    text: 'text-[#991b1b] dark:text-[#fecaca]',
    border: 'border-b border-[#fecaca] dark:border-[#fecaca]/20',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-[#f0fdf4] dark:bg-[#10b981]/10',
    text: 'text-[#166534] dark:text-[#a7f3d0]',
    border: 'border-b border-[#bbf7d0] dark:border-[#bbf7d0]/20',
    icon: CheckCircle,
  },
};

export default function GlobalBanner() {
  const { banner, hideBanner } = useBanner();

  if (!banner) return null;

  const style = bannerStyles[banner.type] || bannerStyles.info;
  const Icon = style.icon;

  return (
    <div className={`relative z-[60] w-full flex items-center justify-center px-4 py-1.5 text-[12.5px] font-medium transition-all ${style.bg} ${style.text} ${style.border || ''}`}>
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <Icon size={14} className="flex-shrink-0" />
        <span className="leading-tight">{banner.message}</span>
        {banner.action && (
          <button
            onClick={banner.action.onClick}
            className={`ml-2 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-[0.05em] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer`}
          >
            {banner.action.label}
            <ExternalLink size={10} />
          </button>
        )}
      </div>
      <button
        onClick={hideBanner}
        className="absolute right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}
