import { useState, useEffect } from 'react';
import apiClient from '../config/api';
import ActionButton from '../components/ActionButton';
import { PlusCircle, Repeat } from 'lucide-react';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await apiClient.get('/subscriptions');
      setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage active recurring subscriptions.</p>
        </div>
        <ActionButton variant="default" label="New Subscription" icon={PlusCircle} className="py-2.5 min-h-[38px]" />
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#222]/50 border-b border-gray-200 dark:border-[#222]">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{String(sub?.id).substring(0, 8)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{sub.plan_id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                    {(sub.status || 'unknown').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
