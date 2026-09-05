import { API_BASE_URL } from '../constants/api';

let onApiError = null;

export function setApiErrorHandler(handler) {
  onApiError = handler;
}

export async function apiClient(endpoint, options = {}) {
  if (!endpoint) {
    const error = new Error('API is not configured');
    error.code = 'NO_ENDPOINT';
    throw error;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
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
