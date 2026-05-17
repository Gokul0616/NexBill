import React from 'react';
import api from '../config/api';
import {
  X, ShieldCheck, Building, Globe, FileText,
  MapPin, Landmark, Key, Check, AlertTriangle, RefreshCw,
  Ban, ShieldAlert, Megaphone
} from 'lucide-react';

export default function MerchantInspector({
  selectedMerchant,
  onClose,
  vStatus,
  setVStatus,
  chargesEnabled,
  setChargesEnabled,
  payoutsEnabled,
  setPayoutsEnabled,
  currentlyDue,
  toggleDueField,
  comments,
  setComments,
  actionLoading,
  onSubmitDecision,
  onSaveSettingsOnly,
  isBlocked,
  setIsBlocked,
  paymentsBlocked,
  setPaymentsBlocked,
  customBannerMessage,
  setCustomBannerMessage,
  isDrawer = false
}) {
  const [banners, setBanners] = React.useState([]);
  const [loadingBanners, setLoadingBanners] = React.useState(false);
  const [editingBannerKey, setEditingBannerKey] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    message: '',
    type: 'info',
    cta_label: '',
    cta_link: '',
    is_enabled: true,
    is_dismissed: false
  });

  const [isCreatingBanner, setIsCreatingBanner] = React.useState(false);
  const [newBannerForm, setNewBannerForm] = React.useState({
    bannerKey: '',
    message: '',
    type: 'info',
    cta_label: '',
    cta_link: '',
    is_enabled: true,
    is_dismissed: false
  });

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBannerForm.bannerKey || !newBannerForm.message) {
      alert('Banner key and message are required.');
      return;
    }
    try {
      const res = await api.post(`/admin/merchants/${selectedMerchant.id}/banners`, {
        bannerKey: newBannerForm.bannerKey.trim().toLowerCase().replace(/\s+/g, '-'),
        message: newBannerForm.message,
        type: newBannerForm.type,
        cta_label: newBannerForm.cta_label || null,
        cta_link: newBannerForm.cta_link || null,
        is_enabled: newBannerForm.is_enabled,
        is_dismissed: newBannerForm.is_dismissed
      });
      if (res.data && res.data.success) {
        setIsCreatingBanner(false);
        setNewBannerForm({
          bannerKey: '',
          message: '',
          type: 'info',
          cta_label: '',
          cta_link: '',
          is_enabled: true,
          is_dismissed: false
        });
        fetchBanners();
      }
    } catch (err) {
      console.error('Failed to create new banner', err);
    }
  };

  const fetchBanners = async () => {
    if (!selectedMerchant?.id) return;
    setLoadingBanners(true);
    try {
      const res = await api.get(`/admin/merchants/${selectedMerchant.id}/banners`);
      if (res.data && res.data.banners) {
        setBanners(res.data.banners);
      }
    } catch (err) {
      console.error('Failed to fetch banners', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  React.useEffect(() => {
    fetchBanners();
    setEditingBannerKey(null);
  }, [selectedMerchant?.id]);

  const handleEditClick = (banner) => {
    setEditingBannerKey(banner.banner_key);
    setEditForm({
      message: banner.message || '',
      type: banner.type || 'info',
      cta_label: banner.cta_label || '',
      cta_link: banner.cta_link || '',
      is_enabled: banner.is_enabled !== false,
      is_dismissed: banner.is_dismissed === true
    });
  };

  const handleSaveBanner = async (bannerKey) => {
    try {
      const res = await api.put(`/admin/merchants/${selectedMerchant.id}/banners/${bannerKey}`, editForm);
      if (res.data && res.data.success) {
        setEditingBannerKey(null);
        fetchBanners();
      }
    } catch (err) {
      console.error('Failed to update banner', err);
    }
  };

  return (
    <div className={isDrawer ? 'flex flex-col h-full' : 'lg:col-span-6 bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-lg flex flex-col overflow-hidden transition-colors duration-200'}>

      {!isDrawer && (
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white">Merchant Inspector</h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Review documents and configure capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- Body Details --- */}
      <div className={`p-6 overflow-y-auto space-y-6 ${isDrawer ? 'flex-1' : 'max-h-[70vh]'}`}>

        {/* Section: Business Legal Info */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5 mb-3">
            <Building className="w-3.5 h-3.5" /> Legal Business Info
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 text-[12px] transition-colors duration-200">
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Legal Name</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.legal_name || selectedMerchant.company || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">DBA / Brand Name</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.doing_business_as || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Business Type</span>
              <span className="font-semibold text-zinc-900 dark:text-white capitalize">{selectedMerchant.business_entity_type || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Industry Group</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.industry || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Business PAN</span>
              <span className="font-mono text-zinc-900 dark:text-white font-semibold uppercase">{selectedMerchant.business_pan || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">GSTIN</span>
              <span className="font-mono text-zinc-900 dark:text-white font-semibold uppercase">{selectedMerchant.gstin || 'N/A'}</span>
            </div>
            {selectedMerchant.reg_number && (
              <div className="col-span-2">
                <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">CIN / Registration Number</span>
                <span className="font-mono text-zinc-900 dark:text-white font-semibold uppercase">{selectedMerchant.reg_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Online Presence & Compliance URLs */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5 mb-3">
            <Globe className="w-3.5 h-3.5" /> Online Presence & Compliance
          </h4>
          <div className="space-y-2 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 text-[12px] transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 dark:text-zinc-505">Website URL</span>
              <a href={selectedMerchant.website_url} target="_blank" rel="noreferrer" className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium">
                {selectedMerchant.website_url || 'N/A'}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 dark:text-zinc-505">Terms & Conditions URL</span>
              <a href={selectedMerchant.tc_url} target="_blank" rel="noreferrer" className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium">
                {selectedMerchant.tc_url || 'N/A'}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 dark:text-zinc-505">Refund Policy URL</span>
              <a href={selectedMerchant.refund_url} target="_blank" rel="noreferrer" className="text-indigo-650 dark:text-indigo-400 hover:underline font-medium">
                {selectedMerchant.refund_url || 'N/A'}
              </a>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Statement Descriptor</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{selectedMerchant.statement_descriptor || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Section: Representative & Address */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5" /> Representative Details
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 text-[12px] transition-colors duration-200">
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Representative Name</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.rep_name || selectedMerchant.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Representative Title</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.rep_title || 'Owner/Executive'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Representative DOB</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.rep_dob || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Representative PAN</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white uppercase">{selectedMerchant.rep_pan || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Representative Aadhaar (last 4)</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{selectedMerchant.rep_aadhaar || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">International Payments</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.accept_international === true || selectedMerchant.accept_international === 'true' ? 'Accepted' : 'No'}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Registered Office Address</span>
              <span className="text-zinc-800 dark:text-white block mt-0.5 leading-normal">
                {[
                  selectedMerchant.business_address_line1,
                  selectedMerchant.business_address_line2,
                  selectedMerchant.business_address_city,
                  selectedMerchant.business_address_state,
                  selectedMerchant.business_address_postal
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Payout Settlement Bank Info */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5 mb-3">
            <Landmark className="w-3.5 h-3.5" /> Payout Bank Details
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 text-[12px] transition-colors duration-200">
            <div className="col-span-2">
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Account Holder Name</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{selectedMerchant.account_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">Account Number</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{selectedMerchant.account_number || '••••••••••••'}</span>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-505 block text-[10px]">IFSC Code</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white uppercase">{selectedMerchant.ifsc || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Section: Document Reviews */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5 mb-3">
            <FileText className="w-3.5 h-3.5" /> Uploaded Document Proofs
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* PAN card */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 rounded-md p-3 text-center flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-505 font-semibold block uppercase">PAN Document</span>
              {selectedMerchant.pan_doc_url ? (
                <>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium truncate flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Document Uploaded
                  </div>
                  <a
                    href={`http://localhost:7123${selectedMerchant.pan_doc_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2 hover:underline cursor-pointer"
                  >
                    View Document
                  </a>
                </>
              ) : (
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-4">Not Uploaded</div>
              )}
            </div>

            {/* Business Proof */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 rounded-md p-3 text-center flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-505 font-semibold block uppercase">Business Proof</span>
              {selectedMerchant.business_proof_url ? (
                <>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium truncate flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Document Uploaded
                  </div>
                  <a
                    href={`http://localhost:7123${selectedMerchant.business_proof_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2 hover:underline cursor-pointer"
                  >
                    View Document
                  </a>
                </>
              ) : (
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-4">Not Uploaded</div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Banners Control Panel */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Merchant Banners Control Panel
            </h4>
            <button
              type="button"
              onClick={() => setIsCreatingBanner(prev => !prev)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded transition-colors"
            >
              {isCreatingBanner ? 'Close Form' : '+ Add Custom Alert'}
            </button>
          </div>

          {isCreatingBanner && (
            <form onSubmit={handleCreateBanner} className="mb-4 p-4 rounded-lg border border-indigo-100 dark:border-indigo-950 bg-indigo-50/10 dark:bg-indigo-950/5 space-y-3">
              <h5 className="text-[12px] font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                Create a Custom Dynamic Alert
              </h5>
              
              {/* Form Input fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold">Banner Key (Slug)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. promo-announcement"
                    value={newBannerForm.bannerKey}
                    onChange={(e) => setNewBannerForm({ ...newBannerForm, bannerKey: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold">Alert Color Type</label>
                  <select
                    value={newBannerForm.type}
                    onChange={(e) => setNewBannerForm({ ...newBannerForm, type: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="critical">Critical (Red)</option>
                    <option value="success">Success (Green)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-semibold">Banner Message Text</label>
                <textarea
                  required
                  placeholder="Enter the alert text that the merchant will see in their dashboard..."
                  value={newBannerForm.message}
                  onChange={(e) => setNewBannerForm({ ...newBannerForm, message: e.target.value })}
                  className="w-full min-h-[50px] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold">CTA Button Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Read news"
                    value={newBannerForm.cta_label}
                    onChange={(e) => setNewBannerForm({ ...newBannerForm, cta_label: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-semibold">CTA Button Redirect Path / Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. /news-link"
                    value={newBannerForm.cta_link}
                    onChange={(e) => setNewBannerForm({ ...newBannerForm, cta_link: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={newBannerForm.is_enabled}
                    onChange={(e) => setNewBannerForm({ ...newBannerForm, is_enabled: e.target.checked })}
                    className="w-3.5 h-3.5 text-indigo-650 rounded border-zinc-300 dark:border-zinc-800 cursor-pointer"
                  />
                  Enable Immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setIsCreatingBanner(false)}
                  className="px-3 py-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded text-[11.5px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11.5px] font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Create & Enable Banner
                </button>
              </div>
            </form>
          )}
          
          {loadingBanners ? (
            <div className="flex items-center justify-center py-6 gap-2 text-zinc-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-[12px]">Loading merchant banners...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((b) => {
                const isEditing = editingBannerKey === b.banner_key;
                const isEnabled = b.is_enabled === true || b.is_enabled === 'true' || b.is_enabled === 't';
                const isDismissed = b.is_dismissed === true || b.is_dismissed === 'true' || b.is_dismissed === 't';
                return (
                  <div 
                    key={b.banner_key} 
                    className={`p-3.5 rounded-lg border text-[12px] transition-all duration-200 ${
                      isEnabled && !isDismissed
                        ? 'bg-zinc-50/80 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/80' 
                        : 'bg-zinc-100/40 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-900/40 opacity-70'
                    }`}
                  >
                    {/* Header: Banner Key & Status Tags */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200/50 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                          {b.banner_key}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.25 rounded uppercase tracking-[0.03em] ${
                          b.type === 'critical' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' :
                          b.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' :
                          b.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                          'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400'
                        }`}>
                          {b.type}
                        </span>
                      </div>
                      
                      {/* Badge status */}
                      <div className="flex items-center gap-2">
                        {!isEnabled && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-650 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.25 rounded font-semibold">
                            Disabled
                          </span>
                        )}
                        {isDismissed && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-500/80 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.25 rounded font-semibold bg-amber-500/5">
                            Dismissed by user
                          </span>
                        )}
                        {isEnabled && !isDismissed && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-1.5 py-0.25 rounded font-semibold bg-emerald-500/5">
                            Active in app
                          </span>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      /* Editing Form View */
                      <div className="space-y-3 mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                        {/* Edit Message */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-semibold">Message Text</label>
                          <textarea
                            value={editForm.message}
                            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                            className="w-full min-h-[50px] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] focus:outline-none focus:border-indigo-500 resize-none text-zinc-900 dark:text-white"
                          />
                        </div>

                        {/* Edit Type & Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-semibold">Alert Type</label>
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                              className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white focus:outline-none"
                            >
                              <option value="info">Info (Blue)</option>
                              <option value="warning">Warning (Amber)</option>
                              <option value="critical">Critical (Red)</option>
                              <option value="success">Success (Green)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-semibold">Action (CTA) Label</label>
                            <input
                              type="text"
                              value={editForm.cta_label}
                              placeholder="e.g. Activate account"
                              onChange={(e) => setEditForm({ ...editForm, cta_label: e.target.value })}
                              className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] text-zinc-400 uppercase font-semibold">Action (CTA) Link / Redirect Path</label>
                            <input
                              type="text"
                              value={editForm.cta_link}
                              placeholder="e.g. /activate"
                              onChange={(e) => setEditForm({ ...editForm, cta_link: e.target.value })}
                              className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded text-[12px] text-zinc-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                            <input
                              type="checkbox"
                              checked={editForm.is_enabled}
                              onChange={(e) => setEditForm({ ...editForm, is_enabled: e.target.checked })}
                              className="w-3.5 h-3.5 text-indigo-650 rounded border-zinc-300 dark:border-zinc-800 cursor-pointer"
                            />
                            Banner Enabled
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                            <input
                              type="checkbox"
                              checked={editForm.is_dismissed}
                              onChange={(e) => setEditForm({ ...editForm, is_dismissed: e.target.checked })}
                              className="w-3.5 h-3.5 text-indigo-650 rounded border-zinc-300 dark:border-zinc-800 cursor-pointer"
                            />
                            Force Dismissed
                          </label>
                        </div>

                        {/* Save / Cancel Action Buttons */}
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingBannerKey(null)}
                            className="px-2.5 py-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveBanner(b.banner_key)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition-all shadow-md shadow-indigo-600/10"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read-Only Mode Display */
                      <div className="mt-1">
                        <p className="text-zinc-600 dark:text-zinc-300 italic font-normal leading-normal text-[11.5px]">
                          "{b.message}"
                        </p>
                        {b.cta_label && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 mt-1.5 font-bold uppercase tracking-[0.02em]">
                            CTA: {b.cta_label} ({b.cta_link})
                          </span>
                        )}
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(b)}
                            className="text-[11px] text-indigo-605 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            Configure Banner
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Verification Decision Form */}
        <form onSubmit={onSubmitDecision} className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505 flex items-center gap-1.5 mb-3">
            <Key className="w-3.5 h-3.5" /> Verification Decision Form
          </h4>

          {/* Verification Status */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Review Decision</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setVStatus('verified'); setChargesEnabled(true); setPayoutsEnabled(true); }}
                className={`flex-1 py-2 px-3 border rounded-md text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${vStatus === 'verified'
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <Check className="w-4 h-4" /> Verify Account
              </button>
              <button
                type="button"
                onClick={() => { setVStatus('action_required'); setChargesEnabled(false); setPayoutsEnabled(false); }}
                className={`flex-1 py-2 px-3 border rounded-md text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${vStatus === 'action_required'
                    ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-500 text-rose-600 dark:text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <AlertTriangle className="w-4 h-4" /> Reject / Restrict
              </button>
            </div>
          </div>

          {/* Toggle Capabilities */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 space-y-3">
            <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase block">Enable Capabilities</label>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-zinc-900 dark:text-white block">Charges Enabled</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-505">Allow payments and checkout operations</span>
              </div>
              <input
                type="checkbox"
                checked={chargesEnabled}
                onChange={e => setChargesEnabled(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800/50">
              <div>
                <span className="text-[12px] font-semibold text-zinc-900 dark:text-white block">Payouts Enabled</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-550">Allow settlements to merchant bank</span>
              </div>
              <input 
                type="checkbox" 
                checked={payoutsEnabled} 
                onChange={e => setPayoutsEnabled(e.target.checked)} 
                className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
              />
            </div>
          </div>

          {/* Risk Management & Restrictions */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 space-y-3">
            <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" /> Risk Management & Restrictions
            </label>
            
            {/* Block / Suspend Account */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5 text-rose-500" /> Suspend Merchant Account
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-505 block">
                  Allow view-only mode, completely disable all data creations
                </span>
              </div>
              <input 
                type="checkbox" 
                checked={isBlocked} 
                onChange={e => setIsBlocked(e.target.checked)} 
                className="w-4.5 h-4.5 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
              />
            </div>

            {/* Block Payments Capability */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800/50">
              <div>
                <span className="text-[12px] font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Block Live Payments
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-550 block">
                  Disable production/live checkouts (Test checkout remains active)
                </span>
              </div>
              <input 
                type="checkbox" 
                checked={paymentsBlocked} 
                onChange={e => setPaymentsBlocked(e.target.checked)} 
                className="w-4.5 h-4.5 rounded text-amber-600 focus:ring-amber-500 border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
              />
            </div>

            {/* Dynamic Custom Banner Message */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/50 space-y-1.5">
              <label className="text-[12px] font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Custom Dashboard Banner Message
              </label>
              <input 
                type="text"
                placeholder="Optional text to alert merchant inside their dashboard..."
                value={customBannerMessage || ''}
                onChange={e => setCustomBannerMessage(e.target.value)}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-900 dark:text-white text-[12px] focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-400 dark:placeholder-zinc-650"
              />
            </div>
          </div>

          {/* Outstanding / Rejected Fields (Currently Due) */}
          {vStatus === 'action_required' && (
            <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 space-y-2">
              <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase block">Required / Outstanding Fields</label>
              <div className="grid grid-cols-2 gap-2 text-[12px] mt-2">
                {[
                  { key: 'business_pan', label: 'Business PAN Document' },
                  { key: 'gstin', label: 'GSTIN proof' },
                  { key: 'website_url', label: 'Website URL' },
                  { key: 'rep_pan', label: 'Representative PAN Card' },
                  { key: 'bank_details', label: 'Bank Payout account' },
                  { key: 'refund_url', label: 'Refund Policy URL' }
                ].map(field => (
                  <label key={field.key} className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={currentlyDue.includes(field.key)}
                      onChange={() => toggleDueField(field.key)}
                      className="w-4 h-4 rounded text-indigo-600 border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Decision Comments / Operator Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Rejection Reason / Verification Comments</label>
            <textarea
              placeholder={vStatus === 'verified' ? 'Optional review comments...' : 'Describe exactly what needs correction (e.g. Blurry PAN Card photo)...'}
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full min-h-[80px] p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-900 dark:text-white text-[12px] focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-zinc-400 dark:placeholder-zinc-600"
            />
          </div>

          {/* Submit Button */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onSaveSettingsOnly}
              className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold py-2 rounded-md text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Settings Only'
              )}
            </button>

            <button
              type="submit"
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Applying Decision...
                </>
              ) : (
                'Apply Verification Decision'
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
