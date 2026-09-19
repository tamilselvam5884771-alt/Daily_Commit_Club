import { fetchApi } from './api.js';

export const simulateSuccess = async (userId, data = {}) => {
  return await fetchApi(`/dev/simulate-success/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const simulateMiss = async (userId, data = {}) => {
  return await fetchApi(`/dev/simulate-miss/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const simulateGitHubError = async (userId) => {
  return await fetchApi(`/dev/simulate-github-error/${userId}`, {
    method: 'POST'
  });
};
