import { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { UserPlus, Mail, Phone, FileDigit } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', gst_number: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/customers', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', gst_number: '' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your clients and their billing profiles.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#246dff] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#222]/50 border-b border-gray-200 dark:border-[#222]">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GST Number</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><Mail className="w-3 h-3"/> {c.email}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><Phone className="w-3 h-3"/> {c.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"><FileDigit className="w-4 h-4 text-gray-400"/> {c.gst_number || '-'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input required type="email" className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input required type="text" className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">GST Number (Optional)</label>
                <input type="text" className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#246dff] hover:bg-blue-600 rounded-lg transition-colors">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
