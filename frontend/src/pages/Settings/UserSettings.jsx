import { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
];

function FocusInput({ className = '', disabled, ...props }) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={`w-full text-[14px] px-3 py-[7px] rounded-md border outline-none transition-all
        ${disabled
          ? 'bg-[#f6f9fc] dark:bg-white/5 border-[#e3e8ef] dark:border-white/10 text-[#697386] cursor-not-allowed'
          : 'bg-white dark:bg-[#0a0a0a] border-[#c4cdd6] dark:border-white/10 text-[#0a2540] dark:text-white focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4]'
        } ${className}`}
    />
  );
}

function FocusSelect({ className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full text-[14px] px-3 py-[7px] rounded-md border bg-white dark:bg-[#0a0a0a] border-[#c4cdd6] dark:border-white/10 text-[#0a2540] dark:text-white outline-none focus:ring-2 focus:ring-[#5469d4]/20 focus:border-[#5469d4] cursor-pointer transition-all ${className}`}
    >
      {children}
    </select>
  );
}

function SaveBar({ label = 'Save changes', message = 'Changes apply to your account only.' }) {
  return (
    <div className="px-6 py-4 border-t border-[#f0f2f5] dark:border-white/5 bg-[#fafbfc] dark:bg-[#1a1a1a] flex justify-end items-center gap-2">
      <span className="text-[12px] text-[#697386] dark:text-gray-500 mr-auto">{message}</span>
      <button className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Cancel</button>
      <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors">{label}</button>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${on ? 'bg-[#5469d4]' : 'bg-[#d8dde6] dark:bg-white/10'}`}
    >
      <div className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all ${on ? 'left-[19px]' : 'left-[3px]'}`} />
    </button>
  );
}

/* ═══════════════════════════════ PROFILE ═══════════════════════════════ */

function ProfileSection({ user }) {
  const initials = (user?.name || 'US').slice(0, 2).toUpperCase();
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Personal information</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Your name and email address.</p>
        </div>
        <div className="p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-7 pb-6 border-b border-[#f0f2f5] dark:border-white/5">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5469d4] to-[#7c5cfc] flex items-center justify-center text-[20px] font-semibold text-white tracking-wider shadow-md">
                {initials}
              </div>
              <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#222] border border-[#e3e8ef] dark:border-white/10 flex items-center justify-center p-0 cursor-pointer shadow-sm hover:scale-110 transition-transform">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#697386] dark:text-gray-400" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </button>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0a2540] dark:text-white mb-0.5">{user?.name || 'User'}</p>
              <p className="text-[12px] text-[#697386] dark:text-gray-400 mb-2">JPG, GIF or PNG · Max 2MB</p>
              <button className="px-3 py-1 text-[12px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors">Upload photo</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Full name</label>
              <FocusInput type="text" defaultValue={user?.name || ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Display name</label>
              <FocusInput type="text" defaultValue={user?.name?.split(' ')[0] || ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">
                Email address
                <span className="ml-1.5 text-[11px] text-[#697386] dark:text-gray-500 font-normal">(cannot be changed)</span>
              </label>
              <FocusInput type="email" defaultValue={user?.email || ''} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Job title</label>
              <FocusInput type="text" placeholder="e.g. Founder" />
            </div>
          </div>
        </div>
        <SaveBar label="Save profile" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ SECURITY ═══════════════════════════════ */

function SecuritySection() {
  const [changingPassword, setChangingPassword] = useState(false);
  const sessions = [
    { device: 'Chrome on macOS', location: 'San Francisco, US', last: 'Active now', current: true },
    { device: 'Safari on iPhone', location: 'San Francisco, US', last: '2 hours ago', current: false },
  ];

  const badgeClass = (status) => `inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${status === 'on'
    ? 'bg-[#d7f7c2] dark:bg-[#0e6027]/20 text-[#0e6027] dark:text-[#a3e635]'
    : 'bg-[#fff3cd] dark:bg-[#7d5a00]/20 text-[#7d5a00] dark:text-[#fbbf24]'
    }`;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Password */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Password</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">A strong password keeps your account secure.</p>
        </div>
        <div className="p-6">
          {!changingPassword ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Change password</p>
                <p className="text-[13px] text-[#697386] dark:text-gray-400">You last changed your password 3 months ago.</p>
              </div>
              <button
                onClick={() => setChangingPassword(true)}
                className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors"
              >
                Change password
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Current password</label>
                <FocusInput type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">New password</label>
                  <FocusInput type="password" placeholder="Min. 8 characters" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Confirm new password</label>
                  <FocusInput type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 text-[14px] font-medium text-white bg-[#5469d4] border border-[#4251b0] rounded-md hover:bg-[#4a5fc1] transition-colors">Update password</button>
                <button
                  onClick={() => setChangingPassword(false)}
                  className="px-4 py-1.5 text-[14px] text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 rounded-md hover:bg-[#f6f9fc] dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Two-factor authentication</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Add an extra layer of security to your account.</p>
        </div>
        <div className="divide-y divide-[#f0f2f5] dark:divide-white/5">
          {[
            { icon: '📱', label: 'Authenticator app', desc: 'Use an app like Google Authenticator or Authy', status: 'on' },
            { icon: '💬', label: 'SMS verification', desc: 'Receive a code via text message', status: 'off' },
          ].map((method, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-5 hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-md bg-[#f6f9fc] dark:bg-white/5 border border-[#e3e8ef] dark:border-white/10 flex items-center justify-center text-[16px] shadow-sm">
                  {method.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-[#0a2540] dark:text-white">{method.label}</span>
                    <span className={badgeClass(method.status)}>{method.status === 'on' ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <span className="text-[12px] text-[#697386] dark:text-gray-400">{method.desc}</span>
                </div>
              </div>
              <button className={`px-4 py-1.5 text-[14px] rounded-md transition-colors ${method.status === 'on'
                ? 'text-[#425466] dark:text-gray-300 bg-white dark:bg-white/5 border border-[#c4cdd6] dark:border-white/10 hover:bg-[#f6f9fc] dark:hover:bg-white/10'
                : 'font-medium text-white bg-[#5469d4] border border-[#4251b0] hover:bg-[#4a5fc1] shadow-sm'
                }`}>
                {method.status === 'on' ? 'Manage' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ APPEARANCE ═══════════════════════════════ */

function AppearanceSection({ theme, setTheme }) {
  const themeOptions = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Appearance</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Choose how the dashboard looks for you.</p>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            {themeOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex-1 p-4 rounded-md border-1.5 transition-all flex flex-col items-center gap-3 cursor-pointer ${theme === opt.id
                  ? 'border-[#5469d4] bg-[#f0f2ff] dark:bg-[#5469d4]/10'
                  : 'border-[#e3e8ef] dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#c4cdd6]'
                  }`}
              >
                <div className={`relative w-16 h-10 rounded-md border overflow-hidden shadow-sm ${opt.id === 'dark' ? 'bg-[#1a1f2e] border-white/5' : opt.id === 'system' ? 'bg-gradient-to-r from-white to-[#1a1f2e] border-[#e3e8ef]' : 'bg-[#f6f9fc] border-[#e3e8ef]'}`}>
                  <div className={`absolute top-1.5 left-1.5 right-1.5 h-1.5 rounded-sm ${opt.id === 'dark' ? 'bg-white/10' : 'bg-[#e3e8ef]'}`} />
                  <div className={`absolute top-4 left-1.5 right-3 h-1.5 rounded-sm ${opt.id === 'dark' ? 'bg-white/20' : 'bg-[#dde1e7]'}`} />
                  <div className={`absolute top-6.5 left-1.5 right-5 h-1.5 rounded-sm ${opt.id === 'dark' ? 'bg-white/10' : 'bg-[#e3e8ef]'}`} />
                </div>
                <span className={`text-[13px] ${theme === opt.id ? 'font-bold text-[#5469d4]' : 'text-[#425466] dark:text-gray-400'}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <SaveBar label="Save appearance" />
      </div>

      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Language & region</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Set your language and local time preferences.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Language</label>
              <FocusSelect>
                <option value="en">English (United States)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </FocusSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#425466] dark:text-gray-400">Time zone</label>
              <FocusSelect>
                <option>Pacific Time (PT)</option>
                <option>Eastern Time (ET)</option>
                <option>London (GMT)</option>
                <option>India (IST)</option>
              </FocusSelect>
            </div>
          </div>
        </div>
        <SaveBar />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ NOTIFICATIONS ═══════════════════════════════ */

function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    payouts: true,
    payments: true,
    disputes: true,
    marketing: false,
    security: true
  });

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Email notifications</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Choose which events you want to be notified about via email.</p>
        </div>
        <div className="divide-y divide-[#f0f2f5] dark:divide-white/5">
          {[
            { id: 'payouts', label: 'Payout updates', desc: 'Get notified when a payout is sent to your bank account.' },
            { id: 'payments', label: 'Successful payments', desc: 'Receive an email for every successful payment.' },
            { id: 'disputes', label: 'Disputes & chargebacks', desc: 'Critical alerts when a customer disputes a payment.' },
            { id: 'security', label: 'Security alerts', desc: 'New logins, password changes, and 2FA updates.' },
            { id: 'marketing', label: 'Product & marketing', desc: 'Tips, feature updates, and periodic newsletters.' },
          ].map((item, i) => (
            <div key={item.id} className="px-6 py-5 flex items-center justify-between hover:bg-[#fafbfc] dark:hover:bg-white/5 transition-colors">
              <div className="max-w-md">
                <p className="text-[14px] font-semibold text-[#0a2540] dark:text-white mb-0.5">{item.label}</p>
                <p className="text-[12px] text-[#697386] dark:text-gray-400">{item.desc}</p>
              </div>
              <Toggle on={notifs[item.id]} onChange={v => setNotifs(n => ({ ...n, [item.id]: v }))} />
            </div>
          ))}
        </div>
        <SaveBar />
      </div>

      <div className="bg-white dark:bg-[#111] border border-[#e3e8ef] dark:border-white/10 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#e3e8ef] dark:border-white/10">
          <p className="text-[15px] font-semibold text-[#0a2540] dark:text-white mb-0.5">Notification frequency</p>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Control how often you receive digest emails.</p>
        </div>
        <div className="p-6">
          <FocusSelect className="w-[200px]">
            <option>Instant (Every event)</option>
            <option>Daily summary</option>
            <option>Weekly digest</option>
            <option>Never</option>
          </FocusSelect>
        </div>
        <SaveBar />
      </div>
    </div>
  );
}

/* ═══════════════════════════════ ROOT ═══════════════════════════════ */

export default function UserSettings() {
  const { user } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);

  const location = useLocation?.() ?? { search: '' };
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && SECTIONS.find(s => s.id === tab)) setActiveSection(tab);
  }, [location]);

  const SECTION_MAP = {
    profile: <ProfileSection user={user} />,
    security: <SecuritySection />,
    appearance: <AppearanceSection theme={theme} setTheme={setTheme} />,
    notifications: <NotificationsSection />,
  };

  return (
    <div className="bg-[#f6f9fc] dark:bg-[#0a0a0a] font-sans text-[#0a2540] dark:text-white pb-20">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-[22px] font-bold text-[#0a2540] dark:text-white mb-1 tracking-tight">Account settings</h1>
          <p className="text-[13px] text-[#697386] dark:text-gray-400">Manage your personal information, security, and account preferences.</p>
        </div>

        <div className="flex gap-0 items-start">
          <aside className="w-[220px] shrink-0 pr-8">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#697386] dark:text-gray-500 px-3 mb-3">Account</p>
            <nav className="flex flex-col gap-0.5">
              {SECTIONS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`block w-full text-left px-3 py-[7px] text-[14px] rounded-r-md transition-all border-l-2 cursor-pointer ${activeSection === item.id
                    ? 'font-bold text-[#5469d4] bg-[#f0f2ff] dark:bg-[#5469d4]/10 border-[#5469d4]'
                    : 'text-[#425466] dark:text-gray-400 border-transparent hover:text-[#5469d4] dark:hover:text-white hover:bg-[#f6f9fc] dark:hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {SECTION_MAP[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
}