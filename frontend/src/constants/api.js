export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
export const employeeTimeOffRequestsPath = (employeeCode) =>
  `/api/hr/employees/${encodeURIComponent(employeeCode)}/time-off/requests`;
