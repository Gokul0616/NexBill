import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';

export default function OnboardingLayout({ children, currentStep = 1, totalSteps = 4 }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#f6f9fc] dark:bg-[#0a0a0b] flex flex-col font-sans">
      {/* Focused Header */}
      <header className="h-16 bg-white dark:bg-[#111] border-b border-[#e3e8ee] dark:border-white/10 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#5469d4] rounded-lg flex items-center justify-center shadow-lg shadow-[#5469d4]/20 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-[16px] font-bold text-[#1a1f36] dark:text-white tracking-tight">NexBill <span className="text-[#5469d4]">Activate</span></span>
          </Link>
          <div className="h-4 w-px bg-[#e3e8ee] dark:bg-white/10 mx-2" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#697386] dark:text-gray-400">Step {currentStep} of {totalSteps}</span>
            <div className="w-32 h-1.5 bg-[#e3e8ee] dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5469d4] rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#697386] hover:text-[#1a1f36] dark:hover:text-white transition-colors"
        >
          Save and exit
          <X size={14} />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center py-12 px-6 overflow-y-auto">
        <div className="w-full max-w-[580px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center border-t border-[#e3e8ee] dark:border-white/5 bg-white dark:bg-[#111]">
        <p className="text-[12px] text-[#697386] dark:text-gray-500">
          © 2026 NexBill Inc. • <span className="hover:underline cursor-pointer">Privacy Policy</span> • <span className="hover:underline cursor-pointer">Terms of Service</span>
        </p>
      </footer>
    </div>
  );
}
