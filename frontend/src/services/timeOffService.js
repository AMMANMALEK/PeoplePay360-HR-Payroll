import { apiClient } from './apiService';
import { TIME_OFF_ENDPOINT } from '../constants/api';
import { INITIAL_TIME_OFF_REQUESTS, INITIAL_ALLOCATIONS, INITIAL_TIME_OFF_TYPES } from '../data/mockData';

export const timeOffService = {
  async getRequests() {
    const data = await apiClient(TIME_OFF_ENDPOINT);
    if (data) return data;
    return INITIAL_TIME_OFF_REQUESTS;
  },

  async getAllocations() {
    const data = await apiClient(`${TIME_OFF_ENDPOINT}/allocations`);
    if (data) return data;
    return INITIAL_ALLOCATIONS;
  },

  async getTypes() {
    const data = await apiClient(`${TIME_OFF_ENDPOINT}/types`);
    if (data) return data;
    return INITIAL_TIME_OFF_TYPES;
  },

  async approveRequest(id) {
    const data = await apiClient(`${TIME_OFF_ENDPOINT}/${id}/approve`, { method: 'POST' });
    return data || { success: true };
  },

  async refuseRequest(id, reason) {
    const data = await apiClient(`${TIME_OFF_ENDPOINT}/${id}/refuse`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return data || { success: true };
  }
};
