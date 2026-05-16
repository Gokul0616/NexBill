import { useState, useEffect } from 'react';
import { useMessage } from '../context/MessageContext';
import { useModal } from '../context/ModalContext';
import apiClient from '../config/api';
import ButtonOutlet from '../components/ButtonOutlet';
import { PlusCircle, Trash2, Calendar, User, Package } from 'lucide-react';

function SubscriptionForm({ onSubmit, customers, plans, onCancel }) {
  const [formData, setFormData] = useState({ customer_id: '', plan_id: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Customer</label>
        <select 
          required 
          className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          value={formData.customer_id}
          onChange={e => setFormData(prev => ({...prev, customer_id: e.target.value}))}
        >
          <option value="">Select a customer...</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Plan</label>
        <select 
          required 
          className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          value={formData.plan_id}
          onChange={e => setFormData(prev => ({...prev, plan_id: e.target.value}))}
        >
          <option value="">Select a plan...</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>{p.name} - ₹{p.price}/{p.billing_cycle}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <ButtonOutlet label="Cancel" onClick={onCancel} variant="secondary" className="px-6" />
        <ButtonOutlet type="submit" label="Create Subscription" variant="default" className="px-6 !bg-[#246dff] !text-white" />
      </div>
    </form>
  );
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, custRes, plansRes] = await Promise.all([
        apiClient.get('/subscriptions'),
        apiClient.get('/customers'),
        apiClient.get('/plans')
      ]);
      setSubscriptions(subsRes.data);
      setCustomers(custRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      showMessage('Failed to fetch data', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (data) => {
    try {
      await apiClient.post('/subscriptions', data);
      closeModal();
      showMessage('Subscription created successfully', 'success');
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to create subscription', 'error');
    }
  };

  const openCreateModal = () => {
    openModal(
      'Create New Subscription',
      <SubscriptionForm 
        onSubmit={handleCreateSubscription} 
        customers={customers} 
        plans={plans} 
        onCancel={closeModal} 
      />,
      'md'
    );
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      showMessage('Subscription cancelled', 'success');
      fetchData();
    } catch (err) {
      showMessage('Failed to cancel subscription', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage active recurring billing cycles.</p>
        </div>
        <ButtonOutlet 
          label="New Subscription" 
          icon={PlusCircle} 
          onClick={openCreateModal}
          className="!h-[38px] !bg-[#246dff] !text-white px-4"
        />
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#222]/50 border-b border-gray-200 dark:border-[#222]">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Next Billing</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {subscriptions.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                  No subscriptions found.
                </td>
              </tr>
            )}
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{sub.customer_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                      <Package className="w-3.5 h-3.5 text-[#246dff]" />
                      {sub.plan_name}
                    </div>
                    <span className="text-xs text-gray-500 ml-5">₹{sub.price} / month</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    sub.status === 'active' 
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {(sub.status || 'unknown').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(sub.next_billing_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {sub.status === 'active' && (
                    <ButtonOutlet 
                      icon={Trash2} 
                      onClick={() => handleCancel(sub.id)}
                      variant="danger"
                      title="Cancel Subscription"
                      className="border-none shadow-none bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
