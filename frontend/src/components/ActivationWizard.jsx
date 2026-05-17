import { useState, useContext } from 'react';
import { Shield, ChevronRight, Building2, UserCircle, CreditCard, CheckCircle2, Loader2, X } from 'lucide-react';
import apiClient from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';

const STEPS = [
  { id: 'business', label: 'Business profile', icon: Building2 },
  { id: 'identity', label: 'Identity', icon: UserCircle },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
];

export default function ActivationWizard({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();
  const [formData, setFormData] = useState({
    legal_name: '',
    website_url: '',
    tax_id: '',
    business_type: 'individual',
    full_name: '',
    dob: '',
    bank_account: '',
    routing_number: '',
  });

  if (!isOpen) return null;

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await apiClient.put('/auth/onboarding', formData);
        showMessage('Onboarding details submitted successfully', 'success');
        onComplete();
        onClose();
      } catch (err) {
        showMessage('Failed to submit onboarding details', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">Legal business name</label>
              <input 
                type="text" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                placeholder="e.g. Acme Inc."
                value={formData.legal_name}
                onChange={e => setFormData({...formData, legal_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">Business website</label>
              <input 
                type="url" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                placeholder="https://example.com"
                value={formData.website_url}
                onChange={e => setFormData({...formData, website_url: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">Tax ID / GSTIN</label>
              <input 
                type="text" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                placeholder="22AAAAA0000A1Z5"
                value={formData.tax_id}
                onChange={e => setFormData({...formData, tax_id: e.target.value})}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">Full legal name</label>
              <input 
                type="text" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                placeholder="As it appears on your ID"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">Date of birth</label>
              <input 
                type="date" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-[#f6f9fc] dark:bg-white/5 p-4 rounded-lg border border-[#e3e8ee] dark:border-white/10 mb-4">
                <p className="text-[12px] text-[#697386] dark:text-gray-400">NexBill will send payouts to this account. Ensure the account name matches your business legal name.</p>
             </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">Account number</label>
              <input 
                type="password" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                placeholder="•••• •••• •••• ••••"
                value={formData.bank_account}
                onChange={e => setFormData({...formData, bank_account: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1.5">IFSC / Routing number</label>
              <input 
                type="text" 
                className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] transition-all"
                placeholder="STRB0000123"
                value={formData.routing_number}
                onChange={e => setFormData({...formData, routing_number: e.target.value})}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a2540]/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#111] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e3e8ee] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5469d4] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a1f36] dark:text-white">Activate Account</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#f6f9fc] dark:hover:bg-white/5 rounded-md text-[#697386] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="px-8 pt-6 pb-2">
           <div className="flex items-center justify-between relative">
              <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-[#f0f2f5] dark:bg-white/5 z-0" />
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const active = idx <= currentStep;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-[#5469d4] text-white shadow-lg shadow-[#5469d4]/30' : 'bg-white dark:bg-[#1a1a1a] text-[#a3acb9] border border-[#e3e8ee] dark:border-white/10'}`}>
                       {idx < currentStep ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'text-[#5469d4]' : 'text-[#a3acb9]'}`}>{step.label}</span>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 min-h-[240px]">
           {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-[#fafbfc] dark:bg-white/2 border-t border-[#e3e8ee] dark:border-white/10 flex justify-between items-center">
          <button 
            disabled={currentStep === 0 || loading}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="text-[14px] font-medium text-[#697386] hover:text-[#1a1f36] dark:hover:text-white disabled:opacity-0 transition-all"
          >
            Back
          </button>
          <button 
            disabled={loading}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[14px] font-bold rounded-md transition-all shadow-md shadow-[#5469d4]/20 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (currentStep === STEPS.length - 1 ? 'Complete activation' : 'Continue')}
            {!loading && currentStep < STEPS.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
