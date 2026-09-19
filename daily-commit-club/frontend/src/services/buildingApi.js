import { fetchApi } from './api.js';

export const getAllBuildings = async () => {
  return await fetchApi('/buildings');
};

export const getBuildingById = async (id) => {
  return await fetchApi(`/buildings/${id}`);
};

export const claimBuildingApi = async (id) => {
  return await fetchApi(`/buildings/${id}/claim`, { method: 'POST' });
};
