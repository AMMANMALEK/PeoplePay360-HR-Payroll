import { apiClient } from './apiService';
import {
  ME_PROFILE_ENDPOINT,
  ME_ATTENDANCE_ENDPOINT,
  ME_ALLOCATIONS_ENDPOINT,
  ME_TIME_OFF_TYPES_ENDPOINT,
  ME_TIME_OFF_REQUESTS_ENDPOINT,
  meAttendancePath,
} from '../constants/api';
import { toFrontendEmployee } from './employeeService';
import { toFrontendAttendance } from './attendanceService';
import { toFrontendAllocation, toFrontendRequest, toFrontendTimeOffType } from './timeOffService';

export function localToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

export function greetingLabel() {
  return greetingForHour(new Date().getHours());
}

export function displayRequestStatus(status) {
  if (status === 'Refused') return 'Rejected';
  return status || 'Pending';
}

export const meService = {
  async getProfile() {
    const response = await apiClient(ME_PROFILE_ENDPOINT);
    return toFrontendEmployee(response.data);
  },

  async updateProfile({ phone }) {
    const response = await apiClient(ME_PROFILE_ENDPOINT, {
      method: 'PUT',
      body: JSON.stringify({ phone }),
    });
    return toFrontendEmployee(response.data);
  },

  async getAttendance() {
    const response = await apiClient(ME_ATTENDANCE_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendAttendance) : [];
  },

  async createAttendance({ attendanceDate, status, checkIn, checkOut, notes }) {
    const payload = {
      attendanceDate: attendanceDate || localToday(),
      status: status || 'present',
    };
    if (checkIn) payload.checkIn = checkIn;
    if (checkOut) payload.checkOut = checkOut;
    if (notes) payload.notes = notes;

    const response = await apiClient(ME_ATTENDANCE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return toFrontendAttendance(response.data);
  },

  async updateAttendance(attendanceId, { checkIn, checkOut }) {
    const payload = {};
    if (checkIn) payload.checkIn = checkIn;
    if (checkOut) payload.checkOut = checkOut;
    const response = await apiClient(meAttendancePath(attendanceId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return toFrontendAttendance(response.data);
  },

  async getAllocations() {
    const response = await apiClient(ME_ALLOCATIONS_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendAllocation) : [];
  },

  async getTimeOffTypes() {
    const response = await apiClient(ME_TIME_OFF_TYPES_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendTimeOffType) : [];
  },

  async getTimeOffRequests() {
    const response = await apiClient(ME_TIME_OFF_REQUESTS_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendRequest) : [];
  },

  async createTimeOffRequest({ timeOffType, startDate, endDate, reason }) {
    const response = await apiClient(ME_TIME_OFF_REQUESTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        timeOffType,
        startDate,
        endDate,
        reason,
      }),
    });
    const mapped = toFrontendRequest(response.data);
    if (mapped && response.remaining != null) {
      mapped.remaining = response.remaining;
    }
    if (mapped) {
      mapped.message = response.message;
    }
    return mapped;
  },
};
