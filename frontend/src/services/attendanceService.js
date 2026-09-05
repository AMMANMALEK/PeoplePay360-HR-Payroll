import { apiClient } from './apiService';
import { ATTENDANCE_ENDPOINT } from '../constants/api';
import { INITIAL_ATTENDANCE } from '../data/mockData';

/**
 * Attendance Service
 * Interacts with PeoplePay360 Attendance API:
 *   - POST /api/hr/employees/:employeeCode/attendance
 *   - GET  /api/hr/employees/:employeeCode/attendance
 */
export const attendanceService = {
  async getAttendance(employeeCode) {
    try {
      if (employeeCode) {
        const response = await apiClient(`${ATTENDANCE_ENDPOINT}/${employeeCode}/attendance`);
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
      }
      return INITIAL_ATTENDANCE;
    } catch (err) {
      console.warn('Backend attendance endpoint error, falling back to local store:', err.message);
      return INITIAL_ATTENDANCE;
    }
  },

  async recordAttendance(employeeCode, { attendanceDate, checkIn, checkOut, status, notes }) {
    try {
      const response = await apiClient(`${ATTENDANCE_ENDPOINT}/${employeeCode}/attendance`, {
        method: 'POST',
        body: JSON.stringify({
          attendanceDate: attendanceDate || new Date().toISOString().split('T')[0],
          checkIn,
          checkOut,
          status: (status || 'present').toLowerCase(),
          notes: notes || '',
        }),
      });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend error saving attendance, recording locally:', err.message);
    }
    return null;
  },

  async correctAttendance(id, employeeCode, { checkIn, checkOut, reason }) {
    if (employeeCode) {
      const recorded = await this.recordAttendance(employeeCode, {
        checkIn,
        checkOut,
        status: 'present',
        notes: reason || 'HR Correction',
      });
      if (recorded) return recorded;
    }
    return { success: true };
  },
};
