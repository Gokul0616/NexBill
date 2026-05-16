import { useState, useContext, useEffect } from 'react';
import { useMessage } from '../context/MessageContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../config/api';
import { AuthContext } from '../context/AuthContext';
import ActionButton from '../components/ActionButton';
import Dropdown from '../components/Dropdown';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';


const COUNTRIES = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'BR', label: '🇧🇷 Brazil' },
  { value: 'MX', label: '🇲🇽 Mexico' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'SE', label: '🇸🇪 Sweden' },
  { value: 'NO', label: '🇳🇴 Norway' },
  { value: 'AE', label: '🇦🇪 UAE' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'KE', label: '🇰🇪 Kenya' },
  { value: 'PK', label: '🇵🇰 Pakistan' },
  { value: 'BD', label: '🇧🇩 Bangladesh' },
  { value: 'ID', label: '🇮🇩 Indonesia' },
  { value: 'PH', label: '🇵🇭 Philippines' },
  { value: 'VN', label: '🇻🇳 Vietnam' },
  { value: 'TH', label: '🇹🇭 Thailand' },
  { value: 'NZ', label: '🇳🇿 New Zealand' },
  { value: 'OTHER', label: '🌍 Other' },
];

const BUSINESS_TYPES = [
  { value: 'SaaS', label: 'SaaS / Software' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Agency', label: 'Agency / Service' },
  { value: 'Education', label: 'Education' },
  { value: 'Marketplace', label: 'Marketplace' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Fintech', label: 'Fintech' },
  { value: 'Other', label: 'Other' },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, token } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleContinueToStep2 = (e) => {
    e.preventDefault();
    if (!email) {
      showMessage('Please enter an email address.', 'error');
      return;
    }
    setStep(2);
  };

  const handleContinueToStep3 = (e) => {
    e.preventDefault();
    if (!fullName || !companyName || !country) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!businessType || !password) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }
    try {
      const res = await apiClient.post('/auth/register', {
        email,
        password,
        name: fullName,
        company: companyName,
        country,
        business_type: businessType,
      });
      login(res.data.token);
      showMessage('Account created successfully! Welcome to NexBill.', 'success');
      window.location.href = '/';
    } catch (err) {
      showMessage(err.response?.data?.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-[#246dff] selection:text-white">

      {/* Left Pane — only on step 1 */}
      {step === 1 && (
        <div className="hidden lg:flex w-1/2 bg-white/40 dark:bg-black/30 backdrop-blur-xl flex-col justify-between p-12 relative overflow-hidden border-r border-white/50 dark:border-white/10">
          <div className="relative z-10 flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="w-8 h-8 border border-white/50 dark:border-white/20 rounded overflow-hidden bg-white/50 dark:bg-black/50">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight">NexBill</span>
          </div>
          <div className="relative z-10 text-gray-900 dark:text-white">
            <h2 className="text-5xl font-bold mb-6 leading-tight">Scale your billing<br />with confidence.</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md">Everything you need to manage subscriptions, invoices, and payments in one unified platform.</p>
          </div>
          <div className="relative z-10 text-sm text-gray-500 dark:text-gray-400">© 2026 NexBill Inc.</div>
        </div>
      )}

      {/* Right Pane — w-1/2 on step 1, full width on steps 2 & 3 */}
      <div
        className={`flex items-center justify-center bg-white/60 dark:bg-black/50 backdrop-blur-2xl relative transition-all duration-500 py-12 ${step === 1 ? 'w-full lg:w-1/2' : 'w-full'
          }`}
      >


        <div className="w-full max-w-[420px] px-6">

          {/* Logo: mobile only on step 1, always on steps 2 & 3 */}
          <div className={`flex justify-center mb-6 ${step === 1 ? 'lg:hidden' : ''}`}>
            <div className="w-10 h-10 border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Headings */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              {step === 1 ? 'Start for free' : step === 2 ? 'Tell us about you' : 'Secure your account'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              {step === 1 ? 'No credit card required.' : step === 2 ? "We'll customize your workspace." : 'Almost there! A few last details.'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 mb-8 justify-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-[#246dff]' : 'w-4 bg-gray-200 dark:bg-gray-800'
                  }`}
              />
            ))}
          </div>

          {/* ── STEP 1 ── Email */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-3 mb-6">
                <button className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-[#333] dark:hover:bg-gray-800 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Google</span>
                </button>
              </div>

              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-widest">or email</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              <form onSubmit={handleContinueToStep2} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1 ml-1">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] dark:bg-[#111] dark:text-white rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] transition-all text-sm"
                    placeholder="name@company.com"
                  />
                </div>
                <ActionButton type="submit" variant="default" label="Continue" className="w-full py-2.5" />
              </form>
            </div>
          )}

          {/* ── STEP 2 ── Name + Company + Country */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setStep(1)} className="flex items-center cursor-pointer gap-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 font-semibold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {/* Email pill */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-[#333] rounded bg-gray-50 dark:bg-[#222] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#246dff] font-bold text-sm">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{email}</div>
              </div>

              <form onSubmit={handleContinueToStep3} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1 ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] dark:bg-[#111] dark:text-white rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] transition-all text-sm"
                      placeholder="John Doe"
                      autoFocus
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1 ml-1">Company</label>
                    <input
                      required
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] dark:bg-[#111] dark:text-white rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] transition-all text-sm"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <Dropdown
                  label="Country"
                  options={COUNTRIES}
                  value={country}
                  onChange={setCountry}
                  placeholder="Select your country..."
                  searchable
                />

                <ActionButton type="submit" variant="default" label="Next Step" className="w-full py-2.5" />
              </form>
            </div>
          )}

          {/* ── STEP 3 ── Business Type + Password */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setStep(2)} className="flex items-center cursor-pointer gap-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 font-semibold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {/* Email pill */}
              <div className="mb-6 p-4 border border-gray-200 dark:border-[#333] rounded bg-gray-50 dark:bg-[#222] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#246dff] font-bold text-sm">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{email}</div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <Dropdown
                  label="Business Type"
                  options={BUSINESS_TYPES}
                  value={businessType}
                  onChange={setBusinessType}
                  placeholder="Select business type..."
                />

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] dark:bg-[#111] dark:text-white rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] transition-all text-sm pr-10"
                      placeholder="min. 8 characters"
                      autoFocus
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                <ActionButton type="submit" variant="default" label="Complete Sign Up" className="w-full py-2.5" />
              </form>
            </div>
          )}

          <div className="mt-8 pt-8 text-center space-y-4">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
              By joining, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
              NexBill will use your information to personalize your experience.
            </p>
            <div className="flex justify-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-4">
              <Link to="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sign in to existing account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}