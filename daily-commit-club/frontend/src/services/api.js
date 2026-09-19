/**
 * Central API Client for Daily Commit Club
 */

const API_BASE_URL = '/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('dcc_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || `HTTP ${res.status} Error`);
    }

    return data;
  } catch (error) {
    console.warn(`[API Call Failed] ${endpoint}:`, error.message);
    throw error;
  }
};
