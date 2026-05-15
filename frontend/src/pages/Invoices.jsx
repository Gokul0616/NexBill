import { useState, useEffect } from 'react';
import apiClient from '../config/api';
import { PlusCircle, FileText, Download } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage customer billing history.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#246dff] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{inv.id.substring(0,8)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">₹{inv.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
