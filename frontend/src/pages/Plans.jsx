import { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { PlusCircle, Box } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Billing Plans</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your recurring pricing tiers.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#246dff] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-[#246dff] rounded-lg flex items-center justify-center mb-4">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{plan.amount / 100}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">/{plan.interval}</span>
            </div>
            <button className="w-full py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
              Edit Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
