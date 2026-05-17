import { createContext, useState, useEffect } from 'react';
import apiClient from '../config/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(true); // Default to Test Mode for fresh logins

  // Real-time compliance / verification state
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [chargesEnabled, setChargesEnabled] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [currentlyDue, setCurrentlyDue] = useState([]);
  const [verificationComments, setVerificationComments] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [customBannerMessage, setCustomBannerMessage] = useState('');
  const [banners, setBanners] = useState([]);

  const refreshVerificationStatus = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/auth/verification-status');
      if (res.data) {
        setVerificationStatus(res.data.verification_status || 'pending');
        setChargesEnabled(res.data.charges_enabled === true || res.data.charges_enabled === 'true');
        setPayoutsEnabled(res.data.payouts_enabled === true || res.data.payouts_enabled === 'true');
        setIsBlocked(res.data.is_blocked === true || res.data.is_blocked === 'true');
        setCustomBannerMessage(res.data.custom_banner_message || '');
        setBanners(res.data.banners || []);
        
        let dueFields = [];
        try {
          dueFields = typeof res.data.currently_due === 'string' 
            ? JSON.parse(res.data.currently_due) 
            : (res.data.currently_due || []);
        } catch {
          dueFields = [];
        }
        setCurrentlyDue(dueFields);
        setVerificationComments(res.data.verification_comments || '');
      }
    } catch (err) {
      console.error('Failed to fetch verification status in context', err);
    }
  };

  const dismissBanner = async (bannerKey) => {
    if (!token) return;
    try {
      await apiClient.post('/auth/dismiss-banner', { bannerKey });
      await refreshVerificationStatus();
    } catch (err) {
      console.error('Failed to dismiss banner in context', err);
    }
  };

  const decodeToken = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      setUser(payload);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      decodeToken(token);
      refreshVerificationStatus();
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setTestMode(true); // Automatically put in test mode on fresh login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const toggleTestMode = () => setTestMode(prev => !prev);

  return (
    <AuthContext.Provider value={{ 
      token, user, login, logout, loading, testMode, toggleTestMode,
      verificationStatus, chargesEnabled, payoutsEnabled, currentlyDue, verificationComments,
      isBlocked, customBannerMessage, banners, dismissBanner,
      refreshVerificationStatus
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
