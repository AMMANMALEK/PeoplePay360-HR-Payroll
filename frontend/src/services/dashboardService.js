import { apiClient } from './apiService';
import { DASHBOARD_ENDPOINT } from '../constants/api';
import { INITIAL_ATTENTION_ITEMS } from '../data/mockData';

export const dashboardService = {
  async getDashboardSummary() {
    const data = await apiClient(DASHBOARD_ENDPOINT);
    if (data) return data;
    return {
      totalEmployees: 248,
      presentToday: 221,
      pendingTimeOff: 12,
      activeContracts: 231,
      attendanceExceptions: 8
    };
  },

  async getAttentionItems() {
    const data = await apiClient(`${DASHBOARD_ENDPOINT}/attention`);
    if (data) return data;
    return INITIAL_ATTENTION_ITEMS;
  }
};
