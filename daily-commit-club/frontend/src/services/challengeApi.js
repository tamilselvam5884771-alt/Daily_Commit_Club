import { fetchApi } from './api.js';

export const getChallengeInfo = async () => {
  return await fetchApi('/challenge');
};

export const getChallengeStatus = async () => {
  return await fetchApi('/challenge/status');
};
