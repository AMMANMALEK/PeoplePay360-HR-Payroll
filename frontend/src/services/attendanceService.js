import { apiClient } from './apiService';
import { ATTENDANCE_LIST_ENDPOINT, employeeAttendancePath } from '../constants/api';

const STATUS_TO_UI = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Incomplete',
  on_leave: 'On Leave',
  overtime: 'Overtime',
  exception: 'Late',
};

function formatClock(value) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatClock12(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function clockToIso(dateStr, clock) {
  if (!clock || clock === '--:--') return null;
  const local = new Date(`${dateStr}T${clock}:00`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

export function normalizeAttendanceStatus(rawStatus, workedHours = 0) {
  const s = String(rawStatus || '').toLowerCase().replace(/[\s-_]/g, '');
  if (s.includes('absent')) return 'Absent';
  if (s.includes('leave')) return 'On Leave';
  if (s.includes('half') || s.includes('incomplete') || s.includes('missing') || (workedHours > 0 && workedHours < 5)) {
    return 'Half-day';
  }
  return 'Present';
}

export function toFrontendAttendance(raw) {
  if (!raw) return null;
  const employee = raw.employee && typeof raw.employee === 'object' ? raw.employee : {};
  const date = raw.attendanceDate
    ? new Date(raw.attendanceDate).toISOString().split('T')[0]
    : '';

  return {
    id: raw._id,
    _id: raw._id,
    employeeId: employee.employeeCode || '',
    employeeCode: employee.employeeCode || '',
    employeeName:
      `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || '',
    department: employee.department || '',
    date,
    checkIn: formatClock(raw.checkIn),
    checkOut: formatClock(raw.checkOut),
    checkInDisplay: formatClock12(raw.checkIn),
    checkOutDisplay: formatClock12(raw.checkOut),
    hasCheckIn: Boolean(raw.checkIn),
    hasCheckOut: Boolean(raw.checkOut),
    workedHours: raw.workedHours ?? 0,
    status: normalizeAttendanceStatus(raw.status, raw.workedHours),
    isException: String(raw.status || '').toLowerCase().includes('absent'),
    correction: raw.correction?.reason
      ? {
          correctedBy: raw.correction.correctedBy || '',
          correctedAt: raw.correction.correctedAt
            ? new Date(raw.correction.correctedAt).toLocaleString()
            : '',
          reason: raw.correction.reason,
        }
      : null,
    notes: raw.notes || '',
  };
}

export const attendanceService = {
  async getAttendance(employeeCode) {
    const response = employeeCode
      ? await apiClient(employeeAttendancePath(employeeCode))
      : await apiClient(ATTENDANCE_LIST_ENDPOINT);
    return Array.isArray(response?.data) ? response.data.map(toFrontendAttendance) : [];
  },

  async recordAttendance(employeeCode, payload) {
    const response = await apiClient(employeeAttendancePath(employeeCode), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return toFrontendAttendance(response.data);
  },

  async correctAttendance(id, employeeCode, { checkIn, checkOut, reason, date }) {
    const response = await apiClient(`${employeeAttendancePath(employeeCode)}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        checkIn: clockToIso(date, checkIn),
        checkOut: clockToIso(date, checkOut),
        status: 'present',
        notes: reason || '',
        correction: {
          correctedBy: 'HR Manager',
          reason: reason || '',
        },
      }),
    });
    return toFrontendAttendance(response.data);
  },
};
