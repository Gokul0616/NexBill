import { useState, useEffect } from 'react';
import { useMessage } from '../context/MessageContext';
import { useModal } from '../context/ModalContext';
import apiClient from '../config/api';
import ActionButton from '../components/ActionButton';
import ButtonOutlet from '../components/ButtonOutlet';
import { PlusCircle, FileText, Download, User, DollarSign } from 'lucide-react';

function InvoiceForm({ onSubmit, customers, onCancel }) {
  const [formData, setFormData] = useState({ customer_id: '', amount: '', status: 'unpaid' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Customer</label>
        <select 
          required 
          className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          value={formData.customer_id}
          onChange={e => setFormData({...formData, customer_id: e.target.value})}
        >
          <option value="">Select a customer...</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            required 
            type="number" 
            className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="0.00" 
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Initial Status</label>
        <select className="w-full border border-gray-300 dark:border-[#333] dark:bg-[#111] dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <ButtonOutlet label="Cancel" onClick={onCancel} variant="secondary" className="px-6" />
        <ButtonOutlet type="submit" label="Generate Invoice" variant="default" className="px-6 !bg-[#246dff] !text-white" />
      </div>
    </form>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const { showMessage } = useMessage();
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      showMessage('Failed to fetch invoices', 'error');
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const handleCreateInvoice = async (data) => {
    try {
      await apiClient.post('/invoices', data);
      closeModal();
      showMessage('Invoice created successfully', 'success');
      fetchInvoices();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to create invoice', 'error');
    }
  };

  const openCreateModal = () => {
    openModal(
      'Create Manual Invoice',
      <InvoiceForm onSubmit={handleCreateInvoice} customers={customers} onCancel={closeModal} />,
      'md'
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage customer billing history.</p>
        </div>
        <ActionButton onClick={openCreateModal} variant="default" label="Create Invoice" icon={PlusCircle} className="py-2.5 min-h-[38px]" />
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#222]/50 border-b border-gray-200 dark:border-[#222]">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {invoices.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                  No invoices found.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">#{String(inv.id).padStart(5, '0')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {inv.customer_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">₹{inv.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {(inv.status || 'unknown').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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
