import { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Building2, UserCircle, CreditCard, ChevronRight, Loader2,
  ArrowLeft, Check, MapPin, Users, Plus, Trash2,
  FileText, Upload, Shield, X, ShieldCheck, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { State, City } from 'country-state-city';
import apiClient from '../config/api';
import { useMessage } from '../context/MessageContext';
import Dropdown from '../components/Dropdown';
import DatePicker from '../components/DatePicker';
import Tooltip from '../components/CustomTooltip';

// ── Constants ────────────────────────────────────────────────────────────────

const COUNTRY_CODE = 'IN';
const ALL_STATES = State.getStatesOfCountry(COUNTRY_CODE).map(s => ({
  value: s.isoCode,
  label: s.name
}));

const STEPS = [
  { id: 'business', label: 'Business', desc: 'Legal entity details', icon: Building2 },
  { id: 'address', label: 'Address', desc: 'Registered office', icon: MapPin },
  { id: 'rep', label: 'Representative', desc: 'Account opener', icon: UserCircle },
  { id: 'owners', label: 'Owners', desc: 'Shareholders ≥ 25%', icon: Users },
  { id: 'verification', label: 'Verification', desc: 'Document upload', icon: FileText },
  { id: 'payouts', label: 'Payout', desc: 'Bank details', icon: CreditCard },
];

const ENTITY_TYPES = [
  "Individual / Sole Proprietorship",
  "Private Limited Company (Pvt Ltd)",
  "One Person Company (OPC)",
  "Limited Liability Partnership (LLP)",
  "Partnership Firm",
  "Public Limited Company",
  "Section 8 / Non-Profit Company",
  "Trust / Society / NGO",
];

const INDUSTRIES = [
  "Software as a Service (SaaS)",
  "E-commerce / Retail",
  "Consulting & Professional Services",
  "Digital Content / Media",
  "Education & Training",
  "Health & Wellness",
  "Travel & Hospitality",
  "Financial Services",
  "Real Estate",
  "Other",
];

const REG_LABELS = {
  "Private Limited Company (Pvt Ltd)": { label: "CIN", hint: "21-character Corporate Identity Number" },
  "One Person Company (OPC)": { label: "CIN", hint: "21-character Corporate Identity Number" },
  "Public Limited Company": { label: "CIN", hint: "21-character Corporate Identity Number" },
  "Limited Liability Partnership (LLP)": { label: "LLPIN", hint: "LLP Identification Number" },
  "Section 8 / Non-Profit Company": { label: "CIN", hint: "21-character Corporate Identity Number" },
};

// Sole Proprietorship skips the Beneficial Owners step entirely —
// there are no shareholders in a sole-proprietor structure.
const isSoleProp = (entityType) =>
  entityType === "Individual / Sole Proprietorship";

// ── Shared primitives ─────────────────────────────────────────────────────────

const INPUT_BASE =
  "w-full bg-white dark:bg-[#0d0d0e] border border-[#d1d5db] dark:border-white/[0.08] rounded-[5px] " +
  "px-3 py-[8px] text-[13.5px] text-[#30313d] dark:text-white outline-none " +
  "transition focus:border-[#5469d4] focus:shadow-[0_0_0_3px_rgba(84,105,212,.15)] " +
  "placeholder:text-[#9ea3b0] shadow-[0_1px_1px_rgba(0,0,0,.04)]";

function Label({ children, required, tooltip }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="block text-[12.5px] font-[570] text-[#30313d] dark:text-[#c7cad3] tracking-[-0.01em]">
        {children}{required && <span className="text-[#df1b41] ml-0.5">*</span>}
      </label>
      {tooltip && (
        <Tooltip text={tooltip} sidebar={false} position="top" trigger="click">
          <button
            type="button"
            className="text-[#9ea3b0] hover:text-[#5469d4] cursor-pointer transition-colors p-0.5 focus:outline-none flex items-center justify-center"
          >
            <HelpCircle size={13} />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

function Hint({ children }) {
  return <p className="mt-1.5 text-[11.5px] text-[#6d6e78] dark:text-[#737584] leading-relaxed">{children}</p>;
}

function Field({ label, hint, required, tooltip, children, className = '' }) {
  return (
    <div className={`space-y-0 ${className}`}>
      {label && <Label required={required} tooltip={tooltip}>{label}</Label>}
      {children}
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}

function Grid({ children, cols = 2 }) {
  return (
    <div className={`grid grid-cols-1 ${cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-[11px] font-[650] text-[#6d6e78] dark:text-[#737584] uppercase tracking-[0.075em] mb-5">
      {children}
    </h3>
  );
}

function Divider() {
  return <hr className="border-none border-t border-[#f0f1f3] dark:border-white/[0.06] my-7" />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ActivateAccount() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();
  const navigate = useNavigate();
  const { refreshVerificationStatus } = useContext(AuthContext);

  const panInputRef = useRef(null);
  const businessProofInputRef = useRef(null);
  const [uploadingPan, setUploadingPan] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [formData, setFormData] = useState({
    legal_name: '', doing_business_as: '', business_entity_type: ENTITY_TYPES[0],
    business_pan: '', gstin: '', reg_number: '', iec: '',
    website_url: '', industry: INDUSTRIES[0], product_description: '',
    statement_descriptor: '', tc_url: '', refund_url: '',
    support_email: '', support_phone: '',
    business_address_line1: '', business_address_line2: '', business_address_city: '',
    business_address_state: ALL_STATES[0].value, business_address_postal: '',
    full_name: '', rep_title: '', dob: '', rep_pan: '', rep_aadhaar: '',
    rep_is_director: false, rep_is_owner: false, rep_is_executive: false,
    rep_ownership: '',
    rep_address_line1: '', rep_address_city: '',
    rep_address_state: ALL_STATES[0].value, rep_address_postal: '',
    account_name: '', account_number: '', account_type: 'current', ifsc: '',
    pan_doc_url: '', business_proof_url: '',
  });

  const soleProp = isSoleProp(formData.business_entity_type);

  // Build the visible steps list — skip Owners for sole proprietors
  const visibleSteps = soleProp
    ? STEPS.filter(s => s.id !== 'owners')
    : STEPS;

  // Map the visible step index to the real STEPS index for renderStep()
  const realStepIndex = (visibleIdx) => {
    const visibleId = visibleSteps[visibleIdx]?.id;
    return STEPS.findIndex(s => s.id === visibleId);
  };

  const businessCities = useMemo(() => {
    return City.getCitiesOfState(COUNTRY_CODE, formData.business_address_state).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [formData.business_address_state]);

  const repCities = useMemo(() => {
    return City.getCitiesOfState(COUNTRY_CODE, formData.rep_address_state).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [formData.rep_address_state]);

  const [owners, setOwners] = useState([]);
  const [tosAccepted, setTosAccepted] = useState(false);

  const set = (k, v) => {
    setFormData(p => {
      const newData = { ...p, [k]: v };
      if (k === 'business_address_state') newData.business_address_city = '';
      if (k === 'rep_address_state') newData.rep_address_city = '';
      return newData;
    });
  };
  const addOwner = () => setOwners(p => [...p, { id: Date.now(), name: '', email: '', pan: '', dob: '', ownership: '' }]);
  const removeOwner = id => setOwners(p => p.filter(o => o.id !== id));
  const updateOwner = (id, k, v) => setOwners(p => p.map(o => o.id === id ? { ...o, [k]: v } : o));

  // ── Validators ───────────────────────────────────────────────────────────

  const isValidUrl = (url) => {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/.*)?$/;
    return regex.test(url);
  };

  const isValidPAN = (pan) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan);
  };

  const isValidGSTIN = (gstin) => {
    if (!gstin) return true;
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gstin);
  };

  const isValidCIN = (cin) => {
    const regex = /^[LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
    return regex.test(cin);
  };

  const isValidLLPIN = (llpin) => {
    const regex = /^[A-Za-z]{2}[A-Za-z0-9-]{1,7}$/;
    return regex.test(llpin);
  };

  const isValidPostalCode = (postal) => {
    const regex = /^[1-9][0-9]{5}$/;
    return regex.test(postal);
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isValidPhone = (phone) => {
    // Indian mobile: 10 digits starting with 6-9
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone.replace(/\s+/g, ''));
  };

  const isValidIFSC = (ifsc) => {
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regex.test(ifsc);
  };

  const isValidIEC = (iec) => {
    // IEC is a 10-digit numeric code issued by DGFT
    const regex = /^[0-9]{10}$/;
    return regex.test(iec);
  };

  const getAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      showMessage('File size must be under 10 MB.', 'error');
      return;
    }

    const fileData = new FormData();
    fileData.append('file', file);

    if (type === 'pan') {
      setUploadingPan(true);
    } else {
      setUploadingProof(true);
    }

    try {
      const res = await apiClient.post('/auth/upload-onboarding-doc', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data && res.data.url) {
        setFormData(prev => ({
          ...prev,
          [type === 'pan' ? 'pan_doc_url' : 'business_proof_url']: res.data.url,
        }));
        showMessage(`${type === 'pan' ? 'PAN Card' : 'Business Proof'} uploaded successfully!`, 'success');
      }
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to upload document.', 'error');
    } finally {
      if (type === 'pan') {
        setUploadingPan(false);
      } else {
        setUploadingProof(false);
      }
    }
  };

  const validateStep = () => {
    // currentStep is an index into visibleSteps; map to real step id
    const stepId = visibleSteps[currentStep]?.id;

    switch (stepId) {
      /* ─── Business Profile ─── */
      case 'business': {
        if (!formData.legal_name || !formData.business_pan || !formData.website_url || !formData.product_description || !formData.statement_descriptor) {
          showMessage('Please fill all required business details.', 'error');
          return false;
        }
        if (formData.legal_name.trim().length < 3) {
          showMessage('Legal Business Name must be at least 3 characters long.', 'error');
          return false;
        }
        if (!isValidPAN(formData.business_pan)) {
          showMessage('Please enter a valid 10-character Business PAN (e.g. ABCDE1234F).', 'error');
          return false;
        }
        if (formData.gstin && !isValidGSTIN(formData.gstin)) {
          showMessage('Please enter a valid 15-digit GSTIN.', 'error');
          return false;
        }

        // CIN / LLPIN — only for entity types that require them
        const expectedReg = REG_LABELS[formData.business_entity_type];
        if (expectedReg) {
          if (!formData.reg_number) {
            showMessage(`Please enter the ${expectedReg.label}.`, 'error');
            return false;
          }
          if (expectedReg.label === 'CIN' && !isValidCIN(formData.reg_number)) {
            showMessage('Please enter a valid 21-character Corporate Identity Number (CIN).', 'error');
            return false;
          }
          if (expectedReg.label === 'LLPIN' && !isValidLLPIN(formData.reg_number)) {
            showMessage('Please enter a valid LLP Identification Number (LLPIN).', 'error');
            return false;
          }
        }

        // IEC — optional, but must be valid if provided
        if (formData.iec && !isValidIEC(formData.iec)) {
          showMessage('Please enter a valid 10-digit IEC (Importer Exporter Code).', 'error');
          return false;
        }

        if (!isValidUrl(formData.website_url)) {
          showMessage('Please enter a valid Business Website URL.', 'error');
          return false;
        }
        if (formData.product_description.trim().length < 15) {
          showMessage('Product description must be at least 15 characters long.', 'error');
          return false;
        }
        if (formData.statement_descriptor.trim().length < 5 || formData.statement_descriptor.trim().length > 22) {
          showMessage('Statement descriptor must be between 5 and 22 characters.', 'error');
          return false;
        }
        if (!formData.tc_url || !isValidUrl(formData.tc_url)) {
          showMessage('Please enter a valid Terms & Conditions URL.', 'error');
          return false;
        }
        if (!formData.refund_url || !isValidUrl(formData.refund_url)) {
          showMessage('Please enter a valid Refund Policy URL.', 'error');
          return false;
        }
        // Support email — optional but must be valid if provided
        if (formData.support_email && !isValidEmail(formData.support_email)) {
          showMessage('Please enter a valid support email address.', 'error');
          return false;
        }
        // Support phone — optional but must be valid if provided
        if (formData.support_phone && !isValidPhone(formData.support_phone)) {
          showMessage('Please enter a valid 10-digit Indian support phone number.', 'error');
          return false;
        }
        return true;
      }

      /* ─── Address ─── */
      case 'address': {
        if (!formData.business_address_line1 || !formData.business_address_city || !formData.business_address_postal) {
          showMessage('Please complete the business address.', 'error');
          return false;
        }
        if (formData.business_address_line1.trim().length < 5) {
          showMessage('Address Line 1 must be at least 5 characters long.', 'error');
          return false;
        }
        if (!isValidPostalCode(formData.business_address_postal)) {
          showMessage('Please enter a valid 6-digit Indian PIN code.', 'error');
          return false;
        }
        return true;
      }

      /* ─── Representative ─── */
      case 'rep': {
        if (!formData.full_name || !formData.rep_title || !formData.rep_pan || !formData.rep_aadhaar || !formData.dob) {
          showMessage('Representative details are incomplete.', 'error');
          return false;
        }
        if (formData.full_name.trim().length < 3) {
          showMessage('Representative Full Legal Name must be at least 3 characters.', 'error');
          return false;
        }
        if (!isValidPAN(formData.rep_pan)) {
          showMessage('Please enter a valid 10-digit Personal PAN (e.g. ABCDE1234F).', 'error');
          return false;
        }
        if (!/^\d{4}$/.test(formData.rep_aadhaar)) {
          showMessage('Aadhaar must be exactly the last 4 digits.', 'error');
          return false;
        }
        const age = getAge(formData.dob);
        if (age < 18) {
          showMessage('Account representative must be at least 18 years old.', 'error');
          return false;
        }
        // Validate rep address fields (they are rendered and required)
        if (!formData.rep_address_line1 || !formData.rep_address_city || !formData.rep_address_postal) {
          showMessage('Please complete the representative\'s residential address.', 'error');
          return false;
        }
        if (formData.rep_address_line1.trim().length < 5) {
          showMessage('Representative address line 1 must be at least 5 characters.', 'error');
          return false;
        }
        if (!isValidPostalCode(formData.rep_address_postal)) {
          showMessage('Please enter a valid 6-digit PIN code for the representative\'s address.', 'error');
          return false;
        }
        // If rep marked as owner, ownership percentage is required
        if (formData.rep_is_owner) {
          const pct = parseFloat(formData.rep_ownership);
          if (!formData.rep_ownership || isNaN(pct) || pct < 25 || pct > 100) {
            showMessage('Please enter the representative\'s ownership percentage (25%–100%).', 'error');
            return false;
          }
        }
        return true;
      }

      /* ─── Beneficial Owners (skipped for Sole Proprietorship) ─── */
      case 'owners': {
        for (let i = 0; i < owners.length; i++) {
          const owner = owners[i];
          if (!owner.name || !owner.email || !owner.pan || !owner.ownership) {
            showMessage(`Please complete all fields for Owner ${i + 1}.`, 'error');
            return false;
          }
          if (owner.name.trim().length < 3) {
            showMessage(`Owner ${i + 1} name must be at least 3 characters.`, 'error');
            return false;
          }
          const ownPct = parseFloat(owner.ownership);
          if (isNaN(ownPct) || ownPct < 25 || ownPct > 100) {
            showMessage(`Owner ${i + 1} ownership percentage must be between 25% and 100%.`, 'error');
            return false;
          }
          if (!isValidEmail(owner.email)) {
            showMessage(`Owner ${i + 1} must have a valid email address.`, 'error');
            return false;
          }
          if (!isValidPAN(owner.pan)) {
            showMessage(`Owner ${i + 1} must have a valid 10-digit PAN.`, 'error');
            return false;
          }
        }
        return true;
      }

      /* ─── Verification ─── */
      case 'verification':
        if (!formData.pan_doc_url) {
          showMessage('Please upload your PAN card document.', 'error');
          return false;
        }
        if (!formData.business_proof_url) {
          showMessage('Please upload your business registration proof.', 'error');
          return false;
        }
        return true;

      /* ─── Payouts ─── */
      case 'payouts': {
        if (!formData.account_name || !formData.account_number || !formData.ifsc) {
          showMessage('Bank details are required for payouts.', 'error');
          return false;
        }
        if (formData.account_name.trim().length < 3) {
          showMessage('Account holder name must be at least 3 characters.', 'error');
          return false;
        }
        if (!/^\d{9,18}$/.test(formData.account_number)) {
          showMessage('Bank account number must be between 9 and 18 digits.', 'error');
          return false;
        }
        if (!isValidIFSC(formData.ifsc)) {
          showMessage('Please enter a valid 11-character IFSC code (e.g. HDFC0001234).', 'error');
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!tosAccepted) { showMessage('Please accept the services agreement.', 'error'); return; }
      setLoading(true);
      try {
        await apiClient.put('/auth/onboarding', {
          ...formData,
          beneficial_owners: soleProp ? [] : owners,
        });
        await refreshVerificationStatus();
        showMessage('Details submitted! Review in progress.', 'success');
        navigate('/');
      } catch { showMessage('Submission failed. Check your data.', 'error'); }
      finally { setLoading(false); }
    }
  };

  const progress = Math.round(((currentStep + 1) / visibleSteps.length) * 100);

  // ── Step renderers ────────────────────────────────────────────────────────

  const renderStep = () => {
    const stepId = visibleSteps[currentStep]?.id;

    switch (stepId) {
      /* ─── Step: Business Profile ─── */
      case 'business': return (
        <motion.div key="step-business" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <StepHeader title="Business Profile" desc="Tell us about your legal entity registered in India." />

          <SectionTitle>Legal identity</SectionTitle>
          <div className="space-y-5">
            <Grid>
              <Field label="Legal business name" required tooltip="The registered legal name of your entity as shown on official incorporation or tax documents.">
                <input className={INPUT_BASE} placeholder="NexBill Technologies Pvt Ltd" value={formData.legal_name} onChange={e => set('legal_name', e.target.value)} />
              </Field>
              <Field label="Trade / DBA name" tooltip="Doing Business As name. The brand or public name your customers recognize (if different from legal name).">
                <input className={INPUT_BASE} placeholder="NexBill" value={formData.doing_business_as} onChange={e => set('doing_business_as', e.target.value)} />
              </Field>
            </Grid>
            <Field label="Business entity type" required tooltip="The legal classification of your business entity (e.g., Sole Proprietorship, Pvt Ltd).">
              <Dropdown
                options={ENTITY_TYPES.map(t => ({ value: t, label: t }))}
                value={formData.business_entity_type}
                onChange={v => set('business_entity_type', v)}
              />
            </Field>
            <Grid>
              <Field label="Business PAN" required hint="10-digit PAN of the entity" tooltip="Permanent Account Number issued by the Income Tax Department to your business entity.">
                <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} maxLength={10} placeholder="ABCDE1234F" value={formData.business_pan} onChange={e => set('business_pan', e.target.value.toUpperCase())} />
              </Field>
              <Field label="GSTIN" hint="Optional — 15-digit GST identification" tooltip="Goods and Services Tax Identification Number issued for tax compliance.">
                <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} maxLength={15} placeholder="22AAAAA0000A1Z5" value={formData.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} />
              </Field>
            </Grid>
            {REG_LABELS[formData.business_entity_type] && (
              <Field
                label={REG_LABELS[formData.business_entity_type].label}
                hint={REG_LABELS[formData.business_entity_type].hint}
                required
                tooltip={formData.business_entity_type.includes('LLP') ? "LLP Identification Number issued upon registration." : "Corporate Identity Number issued by the Registrar of Companies (ROC)."}
              >
                <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} value={formData.reg_number} onChange={e => set('reg_number', e.target.value.toUpperCase())} />
              </Field>
            )}
            <Field label="IEC" hint="Optional — 10-digit Importer Exporter Code (if applicable)" tooltip="Importer Exporter Code issued by DGFT, required only if your business imports or exports goods/services.">
              <input className={`${INPUT_BASE} font-mono tracking-wider`} maxLength={10} placeholder="0512345678" value={formData.iec} onChange={e => set('iec', e.target.value.replace(/\D/g, ''))} />
            </Field>
          </div>

          <Divider />

          <SectionTitle>Online presence</SectionTitle>
          <div className="space-y-5">
            <Grid>
              <Field label="Business website" required tooltip="The primary website or online shop where customers can view or purchase your products or services.">
                <input className={INPUT_BASE} placeholder="https://nexbill.in" value={formData.website_url} onChange={e => set('website_url', e.target.value)} />
              </Field>
              <Field label="Industry" required tooltip="Select the business category that best matches your primary products, services, or model.">
                <Dropdown
                  options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                  value={formData.industry}
                  onChange={v => set('industry', v)}
                />
              </Field>
            </Grid>
            <Field label="Product / service description" required hint="Clearly describe what you sell — this helps avoid verification delays." tooltip="A brief explanation of what you sell, how you operate, and when customers are charged.">
              <textarea className={`${INPUT_BASE} min-h-[90px] resize-none`} placeholder="We provide SaaS billing software for…" value={formData.product_description} onChange={e => set('product_description', e.target.value)} />
            </Field>
            <Field label="Statement descriptor" required hint="Max 22 characters — appears on customers' bank statements." tooltip="The text that appears on your customers' credit card or bank statements for recognizable charges.">
              <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} maxLength={22} placeholder="NEXBILL* SERVICES" value={formData.statement_descriptor} onChange={e => set('statement_descriptor', e.target.value.toUpperCase())} />
            </Field>
            <Grid>
              <Field label="Terms & conditions URL" required tooltip="The public link to your terms of service, which customers must agree to.">
                <input className={INPUT_BASE} placeholder="https://nexbill.in/terms" value={formData.tc_url} onChange={e => set('tc_url', e.target.value)} />
              </Field>
              <Field label="Refund policy URL" required tooltip="The public link detailing your policy on product returns, order cancellations, or refunds.">
                <input className={INPUT_BASE} placeholder="https://nexbill.in/refund" value={formData.refund_url} onChange={e => set('refund_url', e.target.value)} />
              </Field>
            </Grid>
          </div>

          <Divider />

          <SectionTitle>Customer support</SectionTitle>
          <div className="space-y-5">
            <Grid>
              <Field label="Support email" hint="Optional — shown to customers on payment receipts" tooltip="The email address your customers can use to reach your support team.">
                <input className={INPUT_BASE} type="email" placeholder="support@nexbill.in" value={formData.support_email} onChange={e => set('support_email', e.target.value)} />
              </Field>
              <Field label="Support phone" hint="Optional — 10-digit Indian mobile number" tooltip="The phone number your customers can call for support (Indian mobile, 10 digits).">
                <input className={INPUT_BASE} type="tel" maxLength={10} placeholder="9876543210" value={formData.support_phone} onChange={e => set('support_phone', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </Grid>
          </div>
        </motion.div>
      );

      /* ─── Step: Address ─── */
      case 'address': return (
        <motion.div key="step-address" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <StepHeader title="Business Address" desc="Registered office address as it appears on official documents." />
          <SectionTitle>Registered office</SectionTitle>
          <div className="space-y-5">
            <Field label="Address line 1" required tooltip="The street name, building number, suite, or unit of your registered business office.">
              <input className={INPUT_BASE} placeholder="Plot 12, Financial District" value={formData.business_address_line1} onChange={e => set('business_address_line1', e.target.value)} />
            </Field>
            <Field label="Address line 2" tooltip="Apartment, suite, unit, building, floor, or additional registered address details (optional).">
              <input className={INPUT_BASE} placeholder="Floor 4, Block B" value={formData.business_address_line2} onChange={e => set('business_address_line2', e.target.value)} />
            </Field>
            <Grid cols={3}>
              <Field label="State" required tooltip="The state or union territory of India where your business registered office is located.">
                <Dropdown
                  options={ALL_STATES}
                  value={formData.business_address_state}
                  onChange={v => set('business_address_state', v)}
                  placeholder="Select state"
                  searchable
                />
              </Field>
              <Field label="City" required tooltip="The city where your business registered office is legally located.">
                <Dropdown
                  options={businessCities}
                  value={formData.business_address_city}
                  onChange={v => set('business_address_city', v)}
                  placeholder="Select city"
                  searchable
                />
              </Field>
              <Field label="PIN code" required tooltip="The 6-digit Indian Postal Index Number corresponding to your registered address.">
                <input className={INPUT_BASE} maxLength={6} placeholder="500032" value={formData.business_address_postal} onChange={e => set('business_address_postal', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </Grid>
          </div>
        </motion.div>
      );

      /* ─── Step: Representative ─── */
      case 'rep': return (
        <motion.div key="step-rep" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <StepHeader title="Account Representative" desc="The person opening this account and legally responsible for it." />
          <SectionTitle>Personal identity</SectionTitle>
          <div className="space-y-5">
            <Grid>
              <Field label="Full legal name" required tooltip="Your complete legal name as it appears on your official government ID (PAN or Aadhaar).">
                <input className={INPUT_BASE} placeholder="Aditya Sharma" value={formData.full_name} onChange={e => set('full_name', e.target.value)} />
              </Field>
              <Field label="Job title" required tooltip="Your official designation or role within the company (e.g. CEO, Founder, Director).">
                <input className={INPUT_BASE} placeholder="Chief Executive Officer" value={formData.rep_title} onChange={e => set('rep_title', e.target.value)} />
              </Field>
            </Grid>
            <Grid>
              <Field label="Personal PAN" required hint="10-digit PAN of the individual" tooltip="Your individual 10-digit Permanent Account Number for identity verification.">
                <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} maxLength={10} placeholder="ABCDE1234F" value={formData.rep_pan} onChange={e => set('rep_pan', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Aadhaar — last 4 digits" required hint="Used only for identity verification" tooltip="The final 4 digits of your Aadhaar card number, used to comply with e-KYC regulations.">
                <input className={INPUT_BASE} maxLength={4} placeholder="••••" value={formData.rep_aadhaar} onChange={e => set('rep_aadhaar', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </Grid>
            <Field label="Date of birth" required className="max-w-[240px]" tooltip="Your official birth date. Representatives must be 18 years or older.">
              <DatePicker
                value={formData.dob}
                onChange={v => set('dob', v)}
                size="md"
              />
            </Field>
          </div>

          <Divider />

          <SectionTitle>Residential address</SectionTitle>
          <div className="space-y-5">
            <Field label="Address line 1" required tooltip="The street name, building number, or locality of the representative's home address.">
              <input className={INPUT_BASE} placeholder="12, MG Road" value={formData.rep_address_line1} onChange={e => set('rep_address_line1', e.target.value)} />
            </Field>
            <Grid cols={3}>
              <Field label="State" required tooltip="The state of the representative's residential address.">
                <Dropdown
                  options={ALL_STATES}
                  value={formData.rep_address_state}
                  onChange={v => set('rep_address_state', v)}
                  placeholder="Select state"
                  searchable
                />
              </Field>
              <Field label="City" required tooltip="The city of the representative's residential address.">
                <Dropdown
                  options={repCities}
                  value={formData.rep_address_city}
                  onChange={v => set('rep_address_city', v)}
                  placeholder="Select city"
                  searchable
                />
              </Field>
              <Field label="PIN code" required tooltip="The 6-digit PIN code of the representative's residential address.">
                <input className={INPUT_BASE} maxLength={6} placeholder="500032" value={formData.rep_address_postal} onChange={e => set('rep_address_postal', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </Grid>
          </div>

          <Divider />

          <SectionTitle>Role & relationship</SectionTitle>
          <p className="text-[13px] text-[#6d6e78] dark:text-[#737584] mb-4 leading-relaxed">
            Select all roles that apply to this representative within the company.
          </p>
          <div className="flex flex-wrap gap-2.5 mb-5">
            {[
              { id: 'rep_is_director', label: 'Director' },
              { id: 'rep_is_owner', label: 'Owner (≥ 25%)' },
              { id: 'rep_is_executive', label: 'Senior executive' },
            ].map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => set(role.id, !formData[role.id])}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-[5px] text-[13px] font-[540] border transition-all cursor-pointer ${formData[role.id]
                  ? 'bg-[#5469d4]/[0.08] border-[#5469d4] text-[#5469d4] dark:bg-[#5469d4]/20'
                  : 'bg-white dark:bg-transparent border-[#d1d5db] dark:border-white/[0.08] text-[#6d6e78] dark:text-[#9ea3b0] hover:border-[#9ea3b0]'
                  }`}
              >
                {formData[role.id] && <Check size={13} strokeWidth={3} />}
                {role.label}
              </button>
            ))}
          </div>

          {/* Show ownership % field only when Owner role is selected */}
          {formData.rep_is_owner && (
            <Field label="Ownership percentage" required hint="Must be 25% or above" tooltip="The direct or indirect equity shareholding percentage held by this representative.">
              <input
                className={INPUT_BASE}
                placeholder="e.g. 51"
                value={formData.rep_ownership}
                onChange={e => set('rep_ownership', e.target.value)}
              />
            </Field>
          )}
        </motion.div>
      );

      /* ─── Step: Beneficial Owners (hidden for Sole Proprietorship) ─── */
      case 'owners': return (
        <motion.div key="step-owners" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-[22px] font-[640] text-[#30313d] dark:text-white tracking-[-0.02em] mb-1.5">Beneficial Owners</h2>
              <p className="text-[14px] text-[#6d6e78] dark:text-[#737584]">Add individuals who own or control 25% or more of the business.</p>
            </div>
            <button
              onClick={addOwner}
              className="flex items-center gap-1.5 px-4 py-[8px] bg-[#5469d4] hover:bg-[#4a5fc1] text-white text-[13px] font-[570] rounded-[5px] transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Add owner
            </button>
          </div>

          {owners.length === 0 ? (
            <div className="border border-dashed border-[#d1d5db] dark:border-white/[0.08] rounded-[8px] py-14 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f4f4f5] dark:bg-white/[0.06] flex items-center justify-center">
                <Users size={18} className="text-[#9ea3b0]" />
              </div>
              <p className="text-[13.5px] font-[540] text-[#30313d] dark:text-[#c7cad3]">No additional owners declared</p>
              <p className="text-[12.5px] text-[#6d6e78]">Only the representative is currently declared as an owner.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {owners.map((o, i) => (
                <div key={o.id} className="border border-[#e5e7eb] dark:border-white/[0.08] rounded-[8px] p-6">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] font-[650] text-[#6d6e78] uppercase tracking-[0.07em]">Owner {i + 1}</span>
                    <button onClick={() => removeOwner(o.id)} className="text-[#9ea3b0] hover:text-[#df1b41] transition-colors p-1 rounded cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-5">
                    <Grid>
                      <Field label="Full name" required tooltip="Full legal name of the beneficial owner holding a significant equity stake.">
                        <input className={INPUT_BASE} value={o.name} onChange={e => updateOwner(o.id, 'name', e.target.value)} />
                      </Field>
                      <Field label="Ownership %" required hint="Must be 25% or above" tooltip="The direct or indirect equity shareholding percentage (must be 25% or greater).">
                        <input className={INPUT_BASE} placeholder="e.g. 51" value={o.ownership} onChange={e => updateOwner(o.id, 'ownership', e.target.value)} />
                      </Field>
                    </Grid>
                    <Grid>
                      <Field label="Email" required tooltip="Contact email address of the beneficial owner for verification notifications.">
                        <input className={INPUT_BASE} type="email" value={o.email} onChange={e => updateOwner(o.id, 'email', e.target.value)} />
                      </Field>
                      <Field label="Personal PAN" required tooltip="The individual 10-digit PAN of the beneficial owner for financial compliance.">
                        <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} maxLength={10} value={o.pan} onChange={e => updateOwner(o.id, 'pan', e.target.value.toUpperCase())} />
                      </Field>
                    </Grid>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );

      /* ─── Step: Verification ─── */
      case 'verification': return (
        <motion.div key="step-verification" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <StepHeader title="Verification" desc="Upload clear, unaltered copies of the documents listed below." />
          <SectionTitle>Identity documents</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PAN card upload */}
            <div>
              <Label required={true}>PAN card (front)</Label>
              <input
                type="file"
                ref={panInputRef}
                className="hidden"
                accept=".jpg,.jpeg,.png"
                onChange={e => handleFileChange(e, 'pan')}
              />
              <div
                onClick={() => !uploadingPan && panInputRef.current?.click()}
                className="mt-1.5 border border-dashed border-[#d1d5db] dark:border-white/[0.08] rounded-[6px] px-6 py-10 flex flex-col items-center gap-3 cursor-pointer hover:border-[#5469d4] hover:bg-[#5469d4]/[0.02] transition-all group relative min-h-[160px] justify-center"
              >
                {uploadingPan ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#5469d4]" />
                    <p className="text-[13px] font-[540] text-[#30313d] dark:text-[#c7cad3]">Uploading document...</p>
                  </div>
                ) : formData.pan_doc_url ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-9 h-9 rounded-full bg-[#e6f4ea] dark:bg-[#e6f4ea]/10 flex items-center justify-center text-[#137333]">
                      <Check size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#137333]">PAN Card Uploaded</p>
                      {formData.pan_doc_url.toLowerCase().match(/\.(jpeg|jpg|png)$/) ? (
                        <div className="mt-2 relative group-hover:scale-105 transition-all">
                          <img
                            src={`http://localhost:7123${formData.pan_doc_url}`}
                            alt="PAN Card Preview"
                            className="max-h-[80px] rounded-md border border-[#d1d5db] dark:border-white/10 shadow-sm"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#6d6e78] dark:text-[#9ea3b0] break-all">{formData.pan_doc_url}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, pan_doc_url: '' }));
                        if (panInputRef.current) panInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-[#f4f4f5] dark:bg-white/[0.06] flex items-center justify-center group-hover:bg-[#5469d4]/10 transition-colors">
                      <Upload size={16} className="text-[#9ea3b0] group-hover:text-[#5469d4] transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-[540] text-[#30313d] dark:text-[#c7cad3]">Click to upload</p>
                      <p className="text-[12px] text-[#9ea3b0] mt-0.5">JPEG or PNG, under 10 MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Business Proof upload */}
            <div>
              <Label required={true}>Business proof (GST or CoI)</Label>
              <input
                type="file"
                ref={businessProofInputRef}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => handleFileChange(e, 'proof')}
              />
              <div
                onClick={() => !uploadingProof && businessProofInputRef.current?.click()}
                className="mt-1.5 border border-dashed border-[#d1d5db] dark:border-white/[0.08] rounded-[6px] px-6 py-10 flex flex-col items-center gap-3 cursor-pointer hover:border-[#5469d4] hover:bg-[#5469d4]/[0.02] transition-all group relative min-h-[160px] justify-center"
              >
                {uploadingProof ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#5469d4]" />
                    <p className="text-[13px] font-[540] text-[#30313d] dark:text-[#c7cad3]">Uploading document...</p>
                  </div>
                ) : formData.business_proof_url ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-9 h-9 rounded-full bg-[#e6f4ea] dark:bg-[#e6f4ea]/10 flex items-center justify-center text-[#137333]">
                      <Check size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#137333]">Business Proof Uploaded</p>
                      {formData.business_proof_url.toLowerCase().match(/\.(jpeg|jpg|png)$/) ? (
                        <div className="mt-2 relative group-hover:scale-105 transition-all">
                          <img
                            src={`http://localhost:7123${formData.business_proof_url}`}
                            alt="Business Proof Preview"
                            className="max-h-[80px] rounded-md border border-[#d1d5db] dark:border-white/10 shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-center mt-2 px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[11px] text-[#6d6e78] dark:text-[#c7cad3]">
                          <FileText size={12} />
                          <span>PDF Document</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, business_proof_url: '' }));
                        if (businessProofInputRef.current) businessProofInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-[#f4f4f5] dark:bg-white/[0.06] flex items-center justify-center group-hover:bg-[#5469d4]/10 transition-colors">
                      <Upload size={16} className="text-[#9ea3b0] group-hover:text-[#5469d4] transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-[540] text-[#30313d] dark:text-[#c7cad3]">Click to upload</p>
                      <p className="text-[12px] text-[#9ea3b0] mt-0.5">JPEG, PNG, or PDF, under 10 MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );

      /* ─── Step: Payouts ─── */
      case 'payouts': return (
        <motion.div key="step-payouts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          <StepHeader title="Payout Settings" desc="Connect the Indian bank account where you want to receive payouts." />
          <SectionTitle>Bank account</SectionTitle>
          <div className="space-y-5">
            <Field label="Account holder name" required hint="Must exactly match your business's legal name." tooltip="The primary name registered on the bank account. This must match the legal business name.">
              <input className={INPUT_BASE} placeholder="NexBill Technologies Pvt Ltd" value={formData.account_name} onChange={e => set('account_name', e.target.value)} />
            </Field>
            <Field label="Account type" required tooltip="The type of bank account — current accounts are standard for businesses.">
              <Dropdown
                options={[
                  { value: 'current', label: 'Current account' },
                  { value: 'savings', label: 'Savings account' },
                ]}
                value={formData.account_type}
                onChange={v => set('account_type', v)}
              />
            </Field>
            <Grid>
              <Field label="Account number" required tooltip="The complete bank account number where payouts will be electronically settled.">
                <input type="password" className={INPUT_BASE} placeholder="••••••••••••" value={formData.account_number} onChange={e => set('account_number', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="IFSC code" required hint="11-character code on your cheque book" tooltip="The 11-digit Indian Financial System Code identifying your specific bank branch.">
                <input className={`${INPUT_BASE} font-mono tracking-wider uppercase`} maxLength={11} placeholder="HDFC0001234" value={formData.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} />
              </Field>
            </Grid>
          </div>

          <Divider />

          <div className="flex gap-3 p-4 rounded-[6px] bg-[#f8f9fa] dark:bg-white/[0.03] border border-[#e5e7eb] dark:border-white/[0.06]">
            <div className="mt-0.5">
              <input
                type="checkbox"
                id="tos"
                className="w-3.5 h-3.5 rounded border-[#d1d5db] accent-[#5469d4] cursor-pointer"
                checked={tosAccepted}
                onChange={e => setTosAccepted(e.target.checked)}
              />
            </div>
            <label htmlFor="tos" className="text-[13px] text-[#6d6e78] dark:text-[#9ea3b0] leading-relaxed cursor-pointer">
              I agree to the{' '}
              <span className="text-[#5469d4] font-[560] hover:underline cursor-pointer">NexBill Services Agreement</span>{' '}
              and the{' '}
              <span className="text-[#5469d4] font-[560] hover:underline cursor-pointer">Connect India PA/PG terms</span>.
              I authorise NexBill to verify my identity and business details with government databases.
            </label>
          </div>
        </motion.div>
      );

      default: return null;
    }
  };

  function StepHeader({ title, desc }) {
    return (
      <div className="mb-8">
        <h2 className="text-[22px] font-[640] text-[#30313d] dark:text-white tracking-[-0.02em] leading-snug">{title}</h2>
        <p className="text-[14px] text-[#6d6e78] dark:text-[#737584] mt-1.5 leading-relaxed">{desc}</p>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] dark:bg-[#0a0a0b] font-sans">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-[240px] flex-shrink-0 fixed h-full z-10 bg-white dark:bg-[#0f0f10] border-r border-[#e5e7eb] dark:border-white/[0.06] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#f0f1f3] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="NexBill" className="w-8 h-8 object-contain rounded-sm" />
            <span className="text-[15px] font-[660] text-[#30313d] dark:text-white tracking-[-0.02em]">NexBill</span>
          </div>
        </div>

        {/* Progress label */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[10.5px] font-[640] text-[#9ea3b0] uppercase tracking-[0.07em]">Account setup</p>
        </div>

        {/* Steps — use visibleSteps so sidebar reflects the right count */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto">
          {visibleSteps.map((s, i) => {
            const active = i === currentStep;
            const done = i < currentStep;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                disabled={i > currentStep}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] mb-0.5 text-left transition-colors ${active
                  ? 'bg-[#5469d4]/[0.08] dark:bg-[#5469d4]/20'
                  : done
                    ? 'hover:bg-[#f4f4f5] dark:hover:bg-white/[0.04] cursor-pointer'
                    : 'opacity-40 cursor-default'
                  }`}
              >
                <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all text-[11px] font-[680] ${done
                  ? 'bg-[#5469d4] text-white'
                  : active
                    ? 'border-[1.5px] border-[#5469d4] text-[#5469d4]'
                    : 'border-[1.5px] border-[#d1d5db] dark:border-white/20 text-[#9ea3b0]'
                  }`}>
                  {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                </div>
                <div className="min-w-0">
                  <p className={`text-[13px] font-[550] truncate ${active ? 'text-[#5469d4]' : done ? 'text-[#30313d] dark:text-white' : 'text-[#9ea3b0]'
                    }`}>{s.label}</p>
                  <p className="text-[11px] text-[#9ea3b0] dark:text-[#737584] truncate">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="px-5 py-4 border-t border-[#f0f1f3] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-[#9ea3b0]" />
            <span className="text-[11px] text-[#9ea3b0] font-[540]">256-bit encrypted</span>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-[#0f0f10] border-b border-[#e5e7eb] dark:border-white/[0.06] px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-[12.5px] text-[#9ea3b0] font-[540]">
              Step {currentStep + 1} of {visibleSteps.length} — {visibleSteps[currentStep].label}
            </span>
            {/* Progress bar */}
            <div className="w-28 h-[3px] bg-[#f0f1f3] dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5469d4] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Link to="/" className="absolute right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100 cursor-pointer">
            <X size={15} />
          </Link>
        </header>

        {/* Form */}
        <div className="flex-1 py-12 px-8 overflow-y-auto">
          <div className="max-w-[620px] mx-auto pb-16">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Action row */}
            <div className="mt-10 flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-[9px] bg-white dark:bg-[#0f0f10] border border-[#d1d5db] dark:border-white/[0.08] text-[#30313d] dark:text-white text-[13.5px] font-[540] rounded-[5px] hover:bg-[#f8f9fa] dark:hover:bg-white/[0.04] transition-colors shadow-[0_1px_1px_rgba(0,0,0,.04)] cursor-pointer"
                >
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-[9px] bg-[#5469d4] hover:bg-[#4a5fc1] disabled:opacity-60 text-white text-[13.5px] font-[570] rounded-[5px] transition-colors shadow-sm cursor-pointer"
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : currentStep === visibleSteps.length - 1
                    ? 'Complete setup'
                    : 'Continue'
                }
                {!loading && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}