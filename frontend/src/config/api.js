import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || `http://localhost:7123/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if it's a 401 and NOT a login request itself
    if (error.response && error.response.status === 401 && !error.config.url.endsWith('/auth/login')) {
      window.dispatchEvent(new CustomEvent('show-global-message', { 
        detail: { message: 'Session expired. Please login again.', type: 'error' } 
      }));
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
