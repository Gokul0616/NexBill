import React, { createContext, useState, useEffect } from 'react';
import api from '../config/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('console_token');
    const storedUser = localStorage.getItem('console_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user payload', err);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: userToken, role, name } = res.data;
      
      // Store token and user payload
      localStorage.setItem('console_token', userToken);
      const userPayload = { email, role, name };
      localStorage.setItem('console_user', JSON.stringify(userPayload));
      
      setToken(userToken);
      setUser(userPayload);
      return { success: true, role };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please verify credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (email, password, name, company, businessType) => {
    try {
      const res = await api.post('/auth/register', {
        email,
        password,
        name,
        company,
        business_type: businessType || 'individual',
        country: 'IN',
        phone: '9999999999'
      });
      return { success: true, message: 'Account registered successfully. You can now login.' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('console_token');
    localStorage.removeItem('console_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
