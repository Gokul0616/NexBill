import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext';
import { getCustomerFields } from '../../lib/customerFields';
import apiClient from '../../config/api';
import { ArrowLeft } from 'lucide-react';
import ButtonOutlet from '../../components/ButtonOutlet';

export default function CreateCustomer() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const configuredFields = getCustomerFields().filter(f => f.enabled);
    setFields(configuredFields);

    // Seed initial state
    const initialData = {};
    configuredFields.forEach(f => {
      initialData[f.key] = '';
    });
    setFormData(initialData);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- Frontend validations ---
    for (const f of fields) {
      const val = formData[f.key]?.toString().trim();
      if (!val) continue; // Skip empty optional values, HTML5 'required' is handled by browser
      
      // 1. Email check
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showMessage(`Please enter a valid email address for "${f.label}"`, 'error');
        return;
      }
      
      // 2. Website URL check
      if (f.type === 'website' && !/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/.test(val)) {
        showMessage(`Please enter a valid website URL for "${f.label}" (e.g. www.example.com or https://example.com)`, 'error');
        return;
      }
      
      // 3. Number check
      if (f.type === 'number' && isNaN(Number(val))) {
        showMessage(`"${f.label}" must be a valid number`, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      await apiClient.post('/customers', formData);
      showMessage('Customer created successfully', 'success');
      navigate('/customers');
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to create customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans animate-in fade-in duration-300">
      {/* Back navigation & Header */}
      <div className="space-y-2">
        <Link 
          to="/customers" 
          className="inline-flex items-center gap-1 text-[13px] text-[#5469d4] hover:text-[#4a5fc1] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to customers
        </Link>
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1f36] dark:text-white tracking-tight">Add new customer</h1>
          <p className="text-[13px] text-[#697386] dark:text-gray-400 mt-0.5">Configure a client's billing and core information profile.</p>
        </div>
      </div>

      {/* Flat Dynamic Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <p className="text-[14px] font-semibold text-[#1a1f36] dark:text-white pb-2 border-b border-[#e3e8ee] dark:border-white/10">Account details</p>
          
          <div className="grid grid-cols-2 gap-5">
            {fields.map(f => (
              <div 
                key={f.key} 
                className={`flex flex-col gap-1.5 ${f.key === 'name' || f.key === 'email' ? 'col-span-2' : ''}`}
              >
                <label className="text-[12px] font-medium text-[#425466] dark:text-gray-300">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  required={f.required}
                  type={f.type === 'website' ? 'text' : f.type}
                  placeholder={f.placeholder}
                  value={formData[f.key] || ''}
                  onChange={e => handleInputChange(f.key, e.target.value)}
                  className="w-full border border-[#e3e8ee] dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white rounded-md px-3 py-[7px] text-[13px] focus:ring-2 focus:ring-[#5469d4]/30 focus:border-[#5469d4] outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action controls - inline flat styling */}
        <div className="flex justify-end items-center gap-2 pt-5 border-t border-[#e3e8ee] dark:border-white/10">
          <ButtonOutlet 
            type="button"
            label="Cancel" 
            onClick={() => navigate('/customers')} 
            variant="secondary" 
          />
          <ButtonOutlet 
            type="submit"
            label={loading ? "Creating..." : "Save customer"} 
            variant="default"
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
}
