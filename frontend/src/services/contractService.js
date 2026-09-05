import { apiClient } from './apiService';
import { CONTRACTS_ENDPOINT } from '../constants/api';
import { INITIAL_CONTRACTS } from '../data/mockData';

export const contractService = {
  async getContracts() {
    const data = await apiClient(CONTRACTS_ENDPOINT);
    if (data) return data;
    return INITIAL_CONTRACTS;
  },

  async createContract(payload) {
    const data = await apiClient(CONTRACTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data || payload;
  }
};
