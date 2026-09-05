import { API_BASE_URL } from '../constants/api';

export async function authRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}

export const authService = {
  login(email, password) {
    return authRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return authRequest('/api/auth/logout', { method: 'POST' });
  },

  me() {
    return authRequest('/api/auth/me');
  },
};
