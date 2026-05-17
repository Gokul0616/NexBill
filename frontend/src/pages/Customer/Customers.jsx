import { useState, useEffect } from 'react';
import { useMessage } from '../../context/MessageContext';
import apiClient from '../../config/api';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCustomerFields } from '../../lib/customerFields';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [fields, setFields] = useState([]);
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    // Load enabled customer schema fields
    setFields(getCustomerFields().filter(f => f.enabled));
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data);
    } catch {
      showMessage('Failed to fetch customers', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 font-sans animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-[#1a1f36] dark:text-white tracking-tight">Customers</h1>
          <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">Manage your clients and billing profiles.</p>
        </div>
        <button
          onClick={() => navigate('/customers/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-medium rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add customer
        </button>
      </div>

      {/* Dynamic Compilation Table */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ee] dark:border-white/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e3e8ee] dark:border-white/10">
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-[#c4cdd6]" /></th>
              {fields.map(f => (
                <th 
                  key={f.key} 
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500"
                >
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#8792a2] dark:text-gray-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td 
                  colSpan={fields.length + 2} 
                  className="px-4 py-12 text-center text-[13px] text-[#a3acb9] dark:text-gray-500 italic"
                >
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
                {fields.map(f => {
                  if (f.key === 'name') {
                    return (
                      <td key={f.key} className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#5469d4]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-[#5469d4]">
                              {c.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#1a1f36] dark:text-white">
                            {c.name}
                          </span>
                        </div>
                      </td>
                    );
                  }
                  
                  if (f.key === 'gst_number') {
                    return (
                      <td key={f.key} className="px-4 py-3 text-[13px] font-mono text-[#697386] dark:text-gray-400">
                        {c.gst_number || '—'}
                      </td>
                    );
                  }

                  return (
                    <td key={f.key} className="px-4 py-3 text-[13px] text-[#697386] dark:text-gray-400">
                      {c[f.key] || '—'}
                    </td>
                  );
                })}
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