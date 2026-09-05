/**
 * Centralized API configuration for PeoplePay360.
 *
 * Connects to the Express backend service.
 * In development, requests can use VITE_API_BASE_URL or default to http://localhost:5000.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const EMPLOYEES_ENDPOINT = '/api/hr/employees';
export const ATTENDANCE_ENDPOINT = '/api/hr/employees';
export const CONTRACTS_ENDPOINT = '';
export const SCHEDULES_ENDPOINT = '';
export const TIME_OFF_ENDPOINT = '';
export const DASHBOARD_ENDPOINT = '';
export const REPORTS_ENDPOINT = '';
