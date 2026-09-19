import { fetchApi } from './api.js';

export const getMyTodayActivity = async () => {
  return await fetchApi('/activity/me/today');
};

export const getMyActivity = async () => {
  return await fetchApi('/activity/me');
};

export const getUserActivity = async (userId) => {
  return await fetchApi(`/activity/user/${userId}`);
};
