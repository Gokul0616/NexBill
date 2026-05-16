import { useState, useEffect } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useModal } from '../../context/ModalContext';
import apiClient from '../../config/api';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ButtonOutlet from '../../components/ButtonOutlet';

// ── Customer Form ─────────────────────────────────────────────────────────────
function CustomerForm({ onSubmit, initialData = {}, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    gst_number: initialData.gst_number || '',
  });
  const field = (label, key, type = 'text', placeholder = '', required = false) => (
    <div>
      <label className="block text-[13px] font-medium text-[#3c4257] dark:text-gray-300 mb-1">{label}</label>
      <input
        required={required}
        type={type}
        className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#111] dark:text-white rounded-md px-3 py-[7px] text-[13px] focus:ring-2 focus:ring-[#5469d4]/30 focus:border-[#5469d4] outline-none transition-colors"
        value={formData[key]}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      {field('Full Name', 'name', 'text', 'e.g. John Doe', true)}
      {field('Email', 'email', 'email', 'john@example.com', true)}
      {field('Phone', 'phone', 'text', '+91 98765 43210', true)}
      {field('GST Number (Optional)', 'gst_number', 'text', '22AAAAA0000A1Z5')}
      <div className="flex justify-end gap-2 pt-4 border-t border-[#e3e8ee] dark:border-white/10">
        <ButtonOutlet label="Cancel" onClick={onCancel} variant="secondary" />
        <ButtonOutlet label="Save customer" onClick={onSubmit} variant="default" />
      </div>
    </form>
  );
}

// ── Customers List ────────────────────────────────────────────────────────────
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const { showMessage } = useMessage();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data);
    } catch {
      showMessage('Failed to fetch customers', 'error');
    }
  };

  const handleCreate = async (data) => {
    try {
      await apiClient.post('/customers', data);
      closeModal();
      showMessage('Customer added successfully', 'success');
      fetchCustomers();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to add customer', 'error');
    }
  };

  const openCreateModal = () => {
    openModal(
      'Add new customer',
      <CustomerForm onSubmit={handleCreate} onCancel={closeModal} />,
      'md'
    );
  };

  // ── List view ──
  return (
    <div className="max-w-6xl mx-auto space-y-4 font-sans animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-[#1a1f36] dark:text-white tracking-tight">Customers</h1>
          <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">Manage your clients and billing profiles.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-medium rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e3e8ee] dark:border-white/10">
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-[#c4cdd6]" /></th>
              {['Name', 'Email', 'Phone', 'GST Number', 'Joined'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-[13px] text-[#a3acb9] dark:text-gray-500 italic">
                  No customers yet. Add your first customer to get started.
                </td>
              </tr>
            )}
            {customers.map(c => (
              <tr
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="border-b border-[#f6f9fc] dark:border-white/5 last:border-0 hover:bg-[#f6f9fc] dark:hover:bg-white/3 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-[#c4cdd6]" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#5469d4]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-[#5469d4]">
                        {c.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400">{c.email}</td>
                <td className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-[13px] font-mono text-[#697386] dark:text-gray-400">{c.gst_number || '—'}</td>
                <td className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}