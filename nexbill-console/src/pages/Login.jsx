import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';
import { ShieldCheck, ShieldAlert, Eye, EyeOff, RefreshCw, Key, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showMessage('Logged in successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showMessage(result.error || 'Invalid credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-600 dark:text-[#c7cad3] flex items-center justify-center font-sans antialiased relative overflow-hidden transition-colors duration-200">

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] px-6 py-8 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl backdrop-blur-xl shadow-2xl z-10 transition-colors duration-200">

        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-black shadow-lg mb-4">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">NexBill Console</h1>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider font-mono">Admin Operations</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1.5">
            <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wide">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@nexbill.com"
                className="block w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wide">Security Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-9 pr-10 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
            ) : (
              'Authenticate Access'
            )}
          </button>

        </form>



      </div>

    </div>
  );
}
