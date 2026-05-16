import { useState, useEffect } from 'react';
import { useMessage } from '../context/MessageContext';
import { useModal } from '../context/ModalContext';
import apiClient from '../config/api';
import ActionButton from '../components/ActionButton';
import ButtonOutlet from '../components/ButtonOutlet';
import { PlusCircle, Box } from 'lucide-react';

function PlanForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({ name: '', price: '', billing_cycle: 'monthly', features: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
        <input required type="text" className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pro Plan" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
        <input required type="number" className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="999" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
        <select className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.billing_cycle} onChange={e => setFormData({...formData, billing_cycle: e.target.value})}>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Features (Brief Description)</label>
        <textarea className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Up to 100 users, priority support..." rows="3" />
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <ButtonOutlet label="Cancel" onClick={onCancel} variant="secondary" className="px-6" />
        <ButtonOutlet type="submit" label="Create Plan" variant="default" className="px-6 !bg-[#246dff] !text-white" />
      </div>
    </form>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const { showMessage } = useMessage();
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/plans');
      setPlans(res.data);
    } catch (err) {
      showMessage('Failed to fetch plans', 'error');
      console.error(err);
    }
  };

  const handleCreatePlan = async (data) => {
    try {
      await apiClient.post('/plans', data);
      closeModal();
      showMessage('Plan created successfully', 'success');
      fetchPlans();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to create plan', 'error');
    }
  };

  const openCreateModal = () => {
    openModal(
      'Create New Plan',
      <PlanForm onSubmit={handleCreatePlan} onCancel={closeModal} />,
      'md'
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Billing Plans</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your recurring pricing tiers.</p>
        </div>
        <ActionButton onClick={openCreateModal} variant="default" label="Create Plan" icon={PlusCircle} className="py-2.5 min-h-[38px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-[#246dff] rounded-lg flex items-center justify-center mb-4">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.features}</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{plan.price}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">/{plan.billing_cycle}</span>
            </div>
            <ActionButton variant="secondary" label="Edit Plan" className="w-full py-2 min-h-[38px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
