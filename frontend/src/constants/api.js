/**
 * Centralized API configuration for PeoplePay360.
 *
 * Designed to separate mock data from UI components behind standard service interfaces.
 * By default in standalone/hackathon mode, backend API base URL and endpoints remain empty,
 * allowing services to seamlessly operate against the curated, verified mock dataset.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const EMPLOYEES_ENDPOINT = API_BASE_URL ? '/api/hr/employees' : '';
export const ATTENDANCE_ENDPOINT = API_BASE_URL ? '/api/hr/employees' : '';
export const CONTRACTS_ENDPOINT = '';
export const SCHEDULES_ENDPOINT = '';
export const TIME_OFF_ENDPOINT = '';
export const DASHBOARD_ENDPOINT = '';
export const REPORTS_ENDPOINT = '';
