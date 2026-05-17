import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import MetricsSection from '../components/MetricsSection';
import SearchFilters from '../components/SearchFilters';
import MerchantsTable from '../components/MerchantsTable';
import MerchantDrawer from '../components/MerchantDrawer';
import api from '../config/api';
import { useMessage } from '../context/MessageContext';
import { Eye, Users, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { showMessage } = useMessage();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tab control
  const [activeTab, setActiveTab] = useState('activation_requests');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State for verification decision
  const [vStatus, setVStatus] = useState('verified');
  const [chargesEnabled, setChargesEnabled] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [currentlyDue, setCurrentlyDue] = useState([]);
  const [comments, setComments] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [paymentsBlocked, setPaymentsBlocked] = useState(false);
  const [customBannerMessage, setCustomBannerMessage] = useState('');

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/merchants');
      const data = res.data;
      if (data.success) {
        setMerchants(data.merchants || []);
      } else {
        showMessage('Failed to retrieve merchants', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const selectMerchantForReview = (merchant) => {
    setSelectedMerchant(merchant);
    const statusVal = merchant.verification_status || 'pending';
    setVStatus(statusVal === 'pending' ? 'verified' : statusVal);
    setChargesEnabled(merchant.charges_enabled === true || merchant.charges_enabled === 'true' || merchant.charges_enabled === 't');
    setPayoutsEnabled(merchant.payouts_enabled === true || merchant.payouts_enabled === 'true' || merchant.payouts_enabled === 't');
    setIsBlocked(merchant.is_blocked === true || merchant.is_blocked === 'true' || merchant.is_blocked === 't');
    setPaymentsBlocked(merchant.payments_blocked === true || merchant.payments_blocked === 'true' || merchant.payments_blocked === 't');
    setCustomBannerMessage(merchant.custom_banner_message || '');

    let dueArr = [];
    try {
      dueArr = typeof merchant.currently_due === 'string'
        ? JSON.parse(merchant.currently_due)
        : (merchant.currently_due || []);
    } catch {
      dueArr = [];
    }
    setCurrentlyDue(dueArr);
    setComments(merchant.verification_comments || '');
  };

  const handleApplyDecision = async (e) => {
    e.preventDefault();
    if (!selectedMerchant) return;
    setActionLoading(true);
    try {
      const payload = {
        userId: selectedMerchant.id,
        verificationStatus: vStatus || 'pending',
        chargesEnabled, payoutsEnabled,
        currentlyDue: (vStatus || 'pending') === 'verified' ? [] : currentlyDue,
        comments, isBlocked, paymentsBlocked, customBannerMessage
      };
      const res = await api.post('/admin/verify', payload);
      if (res.data.success) {
        showMessage('Verification status updated successfully!', 'success');
        await fetchMerchants();
        setSelectedMerchant(null);
      } else {
        showMessage(res.data.error || 'Failed to apply verification decision', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('API error occurred', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettingsOnly = async (e) => {
    e.preventDefault();
    if (!selectedMerchant) return;
    setActionLoading(true);
    try {
      const payload = {
        userId: selectedMerchant.id,
        verificationStatus: selectedMerchant.verification_status || 'pending',
        chargesEnabled, payoutsEnabled, currentlyDue,
        comments, isBlocked, paymentsBlocked, customBannerMessage
      };
      const res = await api.post('/admin/verify', payload);
      if (res.data.success) {
        showMessage('Merchant configurations saved successfully!', 'success');
        await fetchMerchants();
        setSelectedMerchant(null);
      } else {
        showMessage(res.data.error || 'Failed to save configurations', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('API error occurred', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleDueField = (field) => {
    if (currentlyDue.includes(field)) {
      setCurrentlyDue(currentlyDue.filter(f => f !== field));
    } else {
      setCurrentlyDue([...currentlyDue, field]);
    }
  };

  // Filter merchants list
  const filteredMerchants = merchants.filter(m => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.business_pan || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'activation_requests') {
      const hasOnboarded = m.legal_name || m.business_pan || m.website_url || m.gstin || m.statement_descriptor;
      if (!hasOnboarded || m.verification_status === 'verified') return false;
    }

    if (statusFilter === 'all') return matchesSearch;
    return m.verification_status === statusFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] dark:bg-[#09090b] text-zinc-700 dark:text-zinc-300 antialiased font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top Bar */}
        <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-lg sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">Dashboard</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-mono font-semibold border border-indigo-100 dark:border-indigo-900/30">
              KYC & ONBOARDING
            </span>
          </div>
          <button
            onClick={fetchMerchants}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-6 space-y-6 max-w-[1400px] w-full mx-auto">
          <MetricsSection merchants={merchants} />

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <button
              onClick={() => { setActiveTab('activation_requests'); setSelectedMerchant(null); }}
              className={`px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-px ${
                activeTab === 'activation_requests'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              Activation Queue
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono tabular-nums">
                {merchants.filter(m => (m.legal_name || m.business_pan || m.website_url || m.gstin || m.statement_descriptor) && m.verification_status !== 'verified').length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('all_users'); setSelectedMerchant(null); }}
              className={`px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-all border-b-2 -mb-px ${
                activeTab === 'all_users'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Users className="w-4 h-4" />
              All Users
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono tabular-nums">
                {merchants.length}
              </span>
            </button>
          </div>

          {/* Search & Filter */}
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* Full-width Merchants Table */}
          <MerchantsTable
            loading={loading}
            filteredMerchants={filteredMerchants}
            selectedMerchant={selectedMerchant}
            onSelectMerchant={selectMerchantForReview}
          />
        </main>

        <Footer />
      </div>

      {/* Slide-over Drawer */}
      <MerchantDrawer
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        selectedMerchant={selectedMerchant}
        vStatus={vStatus}
        setVStatus={setVStatus}
        chargesEnabled={chargesEnabled}
        setChargesEnabled={setChargesEnabled}
        payoutsEnabled={payoutsEnabled}
        setPayoutsEnabled={setPayoutsEnabled}
        currentlyDue={currentlyDue}
        toggleDueField={toggleDueField}
        comments={comments}
        setComments={setComments}
        actionLoading={actionLoading}
        onSubmitDecision={handleApplyDecision}
        onSaveSettingsOnly={handleSaveSettingsOnly}
        isBlocked={isBlocked}
        setIsBlocked={setIsBlocked}
        paymentsBlocked={paymentsBlocked}
        setPaymentsBlocked={setPaymentsBlocked}
        customBannerMessage={customBannerMessage}
        setCustomBannerMessage={setCustomBannerMessage}
      />
    </div>
  );
}
