import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ActionButton from '../components/ActionButton';
import { Apple, KeyRound, ArrowLeft, Sun, Moon, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-[#246dff] selection:text-white">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex w-1/2 bg-white/40 dark:bg-black/30 backdrop-blur-xl flex-col justify-between p-12 relative overflow-hidden border-r border-white/50 dark:border-white/10">
        <div className="relative z-10 flex items-center gap-2 text-gray-900 dark:text-white">
          <div className="w-8 h-8 border border-white/50 dark:border-white/20 rounded flex items-center justify-center font-bold text-lg bg-white/50 dark:bg-black/50">NB</div>
          <span className="text-xl font-bold tracking-tight">NexBill</span>
        </div>
        <div className="relative z-10 text-gray-900 dark:text-white">
          <h2 className="text-5xl font-bold mb-6 leading-tight">Your AI workspace,<br />elevated.</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md">Seamlessly manage your billing infrastructure with our industry-leading APIs and stunning dashboard.</p>
        </div>
        <div className="relative z-10 text-sm text-gray-500 dark:text-gray-400">© 2026 NexBill Inc.</div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white/60 dark:bg-black/50 backdrop-blur-2xl relative">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute cursor-pointer top-6 right-6 p-2 rounded-full border border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-full max-w-[400px] px-6">

          {/* Logo (Mobile only) */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="w-10 h-10 border border-gray-200 dark:border-[#333] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-[#246dff] font-bold text-xl tracking-tighter">NB</span>
            </div>
          </div>

          {/* Headings */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Log in to your NexBill account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-100 dark:border-red-800 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Social Buttons */}
              <div className="flex gap-3 mb-3">
                <button className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-[#333] dark:hover:bg-gray-800 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Google</span>
                </button>
                {/* <button className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-[#333] dark:hover:bg-gray-800 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <Apple className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Apple</span>
                </button>
                <button className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-[#333] dark:hover:bg-gray-800 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M0 0h10v10H0z" /><path fill="#7fba00" d="M11 0h10v10H11z" /><path fill="#00a4ef" d="M0 11h10v10H0z" /><path fill="#ffb900" d="M11 11h10v10H11z" /></svg>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Microsoft</span>
                </button> */}
              </div>

              {/* <div className="flex gap-3 mb-6 justify-center">
                <button className="flex-1 cursor-pointer max-w-[120px] flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-[#333] dark:hover:bg-gray-800 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <KeyRound className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Passkey</span>
                </button>
                <button className="flex-1 cursor-pointer max-w-[120px] flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-[#333] dark:hover:bg-gray-800 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-5 h-5 border-2 border-gray-700 dark:border-gray-300 rounded-sm flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">ID</div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">SSO</span>
                </button>
              </div> */}

              {/* Divider */}
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-gray-400 dark:border-gray-400"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 dark:text-gray-400 text-[11px] font-medium">or continue with</span>
                <div className="flex-grow border-t border-gray-400 dark:border-gray-400"></div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-200 dark:border-[#333] dark:bg-[#111] dark:text-white rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] focus:border-[#246dff] transition-all text-sm placeholder-gray-300 dark:placeholder-gray-600"
                    placeholder="Enter your email address..."
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 ml-1">
                    Use an organization email to easily collaborate with teammates
                  </p>
                </div>

                <ActionButton type="submit" variant="default" label="Continue" className="w-full py-2 min-h-[38px]" />
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="mb-6 p-4 border border-gray-200 dark:border-[#333] rounded bg-gray-50 dark:bg-[#222] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#246dff] font-bold">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{email}</div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 dark:border-[#333] dark:bg-[#111] dark:text-white rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#246dff] focus:border-[#246dff] transition-all text-sm placeholder-gray-300 dark:placeholder-gray-600 pr-10"
                      placeholder="Enter your password..."
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <ActionButton type="submit" variant="default" label="Log in" className="w-full py-2 min-h-[38px]" />
              </form>
            </div>
          )}

          <div className="mt-8 pt-8 text-center space-y-4">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              By continuing, you acknowledge that you understand <br />and agree to the <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms & Conditions</a> and <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</a>
            </p>
            <div className="flex justify-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 pt-4">
              <Link to="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sign up for an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
