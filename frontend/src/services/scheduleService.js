import { apiClient } from './apiService';
import { WORKING_SCHEDULES_ENDPOINT } from '../constants/api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const TYPE_TO_BACKEND = {
  'Full-Time': 'fixed',
  Compressed: 'shift',
  'Part-Time': 'flexible',
  fixed: 'fixed',
  flexible: 'flexible',
  shift: 'shift',
};

const TYPE_TO_FRONTEND = {
  fixed: 'Full-Time',
  flexible: 'Part-Time',
  shift: 'Compressed',
};

export function weeklyPatternToDays(weeklyPattern = []) {
  const days = {};
  DAYS.forEach((day) => {
    const entry = (weeklyPattern || []).find((p) => p.day === day);
    if (entry) {
      days[day] = {
        enabled: true,
        start: entry.startTime || '09:00',
        end: entry.endTime || '17:00',
        breakHours: (entry.breakMinutes || 0) / 60,
      };
    } else {
      days[day] = { enabled: false, start: '09:00', end: '17:00', breakHours: 0 };
    }
  });
  return days;
}

export function daysToWeeklyPattern(days = {}) {
  return DAYS.filter((day) => days[day]?.enabled).map((day) => ({
    day,
    startTime: days[day].start,
    endTime: days[day].end,
    breakMinutes: Math.round((Number(days[day].breakHours) || 0) * 60),
  }));
}

export function toFrontendSchedule(raw) {
  if (!raw) return null;
  const weeklyPattern = Array.isArray(raw.weeklyPattern) ? raw.weeklyPattern : [];
  return {
    id: raw.scheduleCode || raw._id,
    _id: raw._id,
    scheduleCode: raw.scheduleCode || '',
    name: raw.name || '',
    type: TYPE_TO_FRONTEND[raw.scheduleType] || raw.scheduleType || '',
    weeklyHours: raw.weeklyHours ?? 0,
    employeesCount: raw.employeesCount ?? 0,
    status: raw.isActive === false ? 'Inactive' : 'Active',
    days: weeklyPatternToDays(weeklyPattern),
    weeklyPattern,
    description: raw.description || '',
  };
}

export function toBackendSchedule(frontend) {
  const weeklyPattern = frontend.weeklyPattern?.length
    ? frontend.weeklyPattern
    : daysToWeeklyPattern(frontend.days || {});

  const payload = {
    name: frontend.name,
    scheduleType: TYPE_TO_BACKEND[frontend.type] || 'fixed',
    weeklyPattern,
    isActive: frontend.status !== 'Inactive',
    description: frontend.description || '',
  };

  if (frontend.scheduleCode) {
    payload.scheduleCode = frontend.scheduleCode;
  }

  return payload;
}

export const scheduleService = {
  async getSchedules() {
    const response = await apiClient(WORKING_SCHEDULES_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendSchedule) : [];
  },

  async createSchedule(payload) {
    const response = await apiClient(WORKING_SCHEDULES_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(toBackendSchedule(payload)),
    });
    return toFrontendSchedule(response.data);
  },

  async updateSchedule(id, payload) {
    const response = await apiClient(`${WORKING_SCHEDULES_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toBackendSchedule(payload)),
    });
    return toFrontendSchedule(response.data);
  },
};
