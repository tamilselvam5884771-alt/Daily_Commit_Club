/**
 * Central API Client for Daily Commit Club
 */

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  // In local development, direct POST requests to backend server on port 5000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

export const fetchApi = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = localStorage.getItem('dcc_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    const text = await res.text();
    let data = null;

    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: { message: `Server returned non-JSON response (HTTP ${res.status}).` } };
      }
    }

    if (!res.ok) {
      const errMsg = data?.error?.message || data?.message || `HTTP ${res.status} Error`;
      throw new Error(errMsg);
    }

    return data || { success: true };
  } catch (error) {
    console.warn(`[API Call Failed] ${endpoint}:`, error.message);
    throw error;
  }
};

