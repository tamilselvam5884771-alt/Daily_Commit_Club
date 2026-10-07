import { fetchApi } from './api.js';

export const getMe = async () => {
  try {
    return await fetchApi('/auth/me');
  } catch (error) {
    return null;
  }
};

export const registerUser = async (data) => {
  const payload = typeof data === 'object' ? data : { name: arguments[0], githubUrl: arguments[1] };
  const res = await fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (res && res.token) {
    localStorage.setItem('dcc_token', res.token);
  }
  return res;
};

export const loginUser = async (nameOrData, password) => {
  const payload = typeof nameOrData === 'object' 
    ? nameOrData 
    : { name: nameOrData, password };
  const res = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (res && res.token) {
    localStorage.setItem('dcc_token', res.token);
  }
  return res;
};

export const verifyGitHubProfileUrl = async (githubUrl) => {
  return await fetchApi('/github/verify', {
    method: 'POST',
    body: JSON.stringify({ githubUrl })
  });
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
