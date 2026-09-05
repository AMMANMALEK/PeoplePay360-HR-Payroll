import { API_BASE_URL } from '../constants/api';

/**
 * Enterprise API Service layer.
 *
 * Designed to abstract HTTP communication.
 * When API_BASE_URL or endpoint paths are empty (""),
 * requests safely return null or throw a recognized NO_ENDPOINT error,
 * allowing services to seamlessly fall back to local/mock store without
 * breaking the UI.
 */
export async function apiClient(endpoint, options = {}) {
  if (!API_BASE_URL || !endpoint) {
    // Backend API is not yet connected. Return null to signal mock store fallback.
    return null;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `API error: ${response.statusText}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}
