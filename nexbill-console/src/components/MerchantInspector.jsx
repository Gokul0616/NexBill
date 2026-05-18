import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import MerchantDetails from './MerchantDetails';
import BannerControlPanel from './BannerControlPanel';
import VerificationForm from './VerificationForm';

export default function MerchantInspector({
  selectedMerchant, onClose,
  vStatus, setVStatus,
  chargesEnabled, setChargesEnabled,
  payoutsEnabled, setPayoutsEnabled,
  currentlyDue, toggleDueField,
  comments, setComments,
  actionLoading, onSubmitDecision, onSaveSettingsOnly,
  isBlocked, setIsBlocked,
  paymentsBlocked, setPaymentsBlocked,
  customBannerMessage, setCustomBannerMessage,
  isDrawer = false
}) {

  const [activeTab, setActiveTab] = React.useState('details');

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'banners', label: 'Banners' },
    { key: 'verification', label: 'Verification' },
  ];

  return (
    <div className={isDrawer ? 'flex flex-col h-full' : 'bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-lg flex flex-col overflow-hidden'}>

      {/* Header — only when not inside drawer (drawer has its own header) */}
      {!isDrawer && (
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white">Merchant Inspector</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800/80 px-5 bg-zinc-50/50 dark:bg-zinc-950/30">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[12px] font-medium cursor-pointer transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body — scrollable */}
      <div className={`p-5 overflow-y-auto space-y-5 ${isDrawer ? 'flex-1' : 'max-h-[70vh]'}`}>
        {activeTab === 'details' && (
          <MerchantDetails merchant={selectedMerchant} />
        )}

        {activeTab === 'banners' && (
          <BannerControlPanel merchantId={selectedMerchant?.id} />
        )}

        {activeTab === 'verification' && (
          <VerificationForm
            vStatus={vStatus} setVStatus={setVStatus}
            chargesEnabled={chargesEnabled} setChargesEnabled={setChargesEnabled}
            payoutsEnabled={payoutsEnabled} setPayoutsEnabled={setPayoutsEnabled}
            currentlyDue={currentlyDue} toggleDueField={toggleDueField}
            comments={comments} setComments={setComments}
            actionLoading={actionLoading}
            onSubmitDecision={onSubmitDecision}
            onSaveSettingsOnly={onSaveSettingsOnly}
            isBlocked={isBlocked} setIsBlocked={setIsBlocked}
            paymentsBlocked={paymentsBlocked} setPaymentsBlocked={setPaymentsBlocked}
            customBannerMessage={customBannerMessage} setCustomBannerMessage={setCustomBannerMessage}
          />
        )}
      </div>
    </div>
  );
}
