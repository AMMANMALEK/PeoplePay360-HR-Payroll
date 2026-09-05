import { apiClient } from './apiService';
import { SCHEDULES_ENDPOINT } from '../constants/api';
import { INITIAL_SCHEDULES } from '../data/mockData';

export const scheduleService = {
  async getSchedules() {
    const data = await apiClient(SCHEDULES_ENDPOINT);
    if (data) return data;
    return INITIAL_SCHEDULES;
  },

  async createSchedule(payload) {
    const data = await apiClient(SCHEDULES_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data || payload;
  }
};
