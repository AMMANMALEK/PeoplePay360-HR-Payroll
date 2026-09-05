import { apiClient } from './apiService';
import { SCHEDULES_ENDPOINT } from '../constants/api';
import { INITIAL_SCHEDULES } from '../data/mockData';

export function toFrontendSchedule(raw) {
  if (!raw) return null;
  return {
    id: raw.scheduleCode || raw._id || raw.id,
    _id: raw._id,
    scheduleCode: raw.scheduleCode,
    name: raw.name || 'Schedule',
    type: raw.scheduleType || raw.type || 'Full-Time',
    weeklyHours: raw.weeklyHours || 40,
    employeesCount: raw.employeesCount || 0,
    status: raw.isActive !== undefined ? (raw.isActive ? 'Active' : 'Inactive') : (raw.status || 'Active'),
    days: raw.weeklyPattern || raw.days || {}
  };
}

export const scheduleService = {
  async getSchedules() {
    try {
      const response = await apiClient(SCHEDULES_ENDPOINT);
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(toFrontendSchedule);
      }
      if (Array.isArray(response) && response.length > 0) {
        return response.map(toFrontendSchedule);
      }
      return INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  },

  async createSchedule(payload) {
    try {
      const response = await apiClient(SCHEDULES_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (response && response.data) return toFrontendSchedule(response.data);
      return response || payload;
    } catch {
      return payload;
    }
  }
};
