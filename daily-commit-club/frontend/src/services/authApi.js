import { fetchApi } from './api.js';

export const getMe = async () => {
  try {
    return await fetchApi('/auth/me');
  } catch (error) {
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await fetchApi('/auth/logout', { method: 'POST' });
  } catch (err) {
    // Ignore error
  } finally {
    localStorage.removeItem('dcc_token');
  }
};

export const getGitHubAuthUrl = () => {
  return '/api/auth/github';
};
