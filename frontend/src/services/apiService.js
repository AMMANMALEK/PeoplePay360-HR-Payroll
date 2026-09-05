import { API_BASE_URL } from '../constants/api';

let onApiError = null;

export function setApiErrorHandler(handler) {
  onApiError = handler;
}

function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

export async function apiClient(endpoint, options = {}) {
  if (!API_BASE_URL || !endpoint) {
    const error = new Error('API is not configured');
    error.code = 'NO_ENDPOINT';
    throw error;
  }

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    const error = new Error('Session expired. Please sign in again.');
    error.status = 401;
    if (onApiError) onApiError(error);
    throw error;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || `API error: ${response.statusText}`);
    error.status = response.status;
    error.data = payload;
    if (onApiError) onApiError(error);
    throw error;
  }

  return payload;
}
