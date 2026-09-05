export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const EMPLOYEES_ENDPOINT = '/api/hr/employees';
export const WORKING_SCHEDULES_ENDPOINT = '/api/hr/working-schedules';
export const ATTENDANCE_LIST_ENDPOINT = '/api/hr/attendance';
export const CONTRACTS_ENDPOINT = '/api/hr/contracts';
export const TIME_OFF_TYPES_ENDPOINT = '/api/hr/time-off/types';
export const TIME_OFF_ALLOCATIONS_ENDPOINT = '/api/hr/time-off/allocations';
export const TIME_OFF_REQUESTS_ENDPOINT = '/api/hr/time-off/requests';

export const employeeAttendancePath = (employeeCode) =>
  `/api/hr/employees/${encodeURIComponent(employeeCode)}/attendance`;
export const employeeContractsPath = (employeeCode) =>
  `/api/hr/employees/${encodeURIComponent(employeeCode)}/contracts`;
export const employeeSchedulePath = (employeeCode) =>
  `/api/hr/employees/${encodeURIComponent(employeeCode)}/working-schedule`;
export const employeeAllocationsPath = (employeeCode) =>
  `/api/hr/employees/${encodeURIComponent(employeeCode)}/time-off/allocations`;
export const ME_PROFILE_ENDPOINT = '/api/me/profile';
export const ME_ATTENDANCE_ENDPOINT = '/api/me/attendance';
export const ME_ALLOCATIONS_ENDPOINT = '/api/me/time-off/allocations';
export const ME_TIME_OFF_TYPES_ENDPOINT = '/api/me/time-off/types';
export const ME_TIME_OFF_REQUESTS_ENDPOINT = '/api/me/time-off/requests';

export const meAttendancePath = (attendanceId) =>
  `/api/me/attendance/${encodeURIComponent(attendanceId)}`;
