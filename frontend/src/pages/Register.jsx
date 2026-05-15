import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { Apple, KeyRound, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter an email address.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/register', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans selection:bg-[#246dff] selection:text-white">
      <div className="w-full max-w-[400px] px-6">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
           <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
             <span className="text-[#246dff] font-bold text-xl tracking-tighter">NB</span>
           </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create your workspace.</h1>
          <p className="text-gray-500 font-medium">Sign up for a NexBill account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Social Buttons */}
            <div className="flex gap-3 mb-3">
              <button className="flex-1 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                 <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                 <span className="text-xs font-semibold text-gray-700">Google</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                 <Apple className="w-5 h-5 text-gray-900" />
                 <span className="text-xs font-semibold text-gray-700">Apple</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                 <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M0 0h10v10H0z"/><path fill="#7fba00" d="M11 0h10v10H11z"/><path fill="#00a4ef" d="M0 11h10v10H0z"/><path fill="#ffb900" d="M11 11h10v10H11z"/></svg>
                 <span className="text-xs font-semibold text-gray-700">Microsoft</span>
              </button>
            </div>

            <div className="flex gap-3 mb-6 justify-center">
              <button className="flex-1 max-w-[120px] flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                 <KeyRound className="w-5 h-5 text-gray-700" />
                 <span className="text-xs font-semibold text-gray-700">Passkey</span>
              </button>
              <button className="flex-1 max-w-[120px] flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                 <div className="w-5 h-5 border-2 border-gray-700 rounded-sm flex items-center justify-center text-[10px] font-bold text-gray-700">ID</div>
                 <span className="text-xs font-semibold text-gray-700">SSO</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-[11px]">or continue with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] focus:border-[#246dff] transition-all text-sm placeholder-gray-300"
                  placeholder="Enter your email address..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-semibold text-white bg-[#246dff] hover:bg-[#1e5ce6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246dff] transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#246dff] font-bold">
                {email.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">{email}</div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] focus:border-[#246dff] transition-all text-sm placeholder-gray-300"
                  placeholder="Create a strong password..."
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-semibold text-white bg-[#246dff] hover:bg-[#1e5ce6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246dff] transition-colors"
              >
                Sign up
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 pt-8 text-center space-y-4">
          <p className="text-[11px] text-gray-400">
            By continuing, you acknowledge that you understand <br/>and agree to the <a href="#" className="underline hover:text-gray-600">Terms & Conditions</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
          </p>
          <div className="flex justify-center gap-4 text-xs font-medium text-gray-500 pt-4">
            <Link to="/login" className="hover:text-gray-900 transition-colors">Already have an account? Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
