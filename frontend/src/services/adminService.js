/**
 * PeoplePay360 Admin & RBAC Service Layer
 * 
 * Live API integration with backend MongoDB endpoints.
 */

import { apiClient } from './apiService';

export const adminService = {
  /**
   * Fetch all users
   */
  async getUsers() {
    const response = await apiClient('/api/admin/users');
    return Array.isArray(response?.data) ? response.data : [];
  },

  /**
   * Create a new platform user
   */
  async createUser(userData, adminName = 'Administrator') {
    const response = await apiClient('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        administrator: adminName,
      }),
    });
    return response.data;
  },

  /**
   * Update an existing user
   */
  async updateUser(userId, updates, adminName = 'Administrator') {
    const response = await apiClient(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        administrator: adminName,
      }),
    });
    return response.data;
  },

  /**
   * Change user role with explicit audit tracking
   */
  async changeUserRole(userId, newRoleCode, adminName = 'Administrator') {
    const response = await apiClient(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({
        role: newRoleCode,
        administrator: adminName,
      }),
    });
    return response.data;
  },

  /**
   * Deactivate a user
   */
  async deactivateUser(userId, adminName = 'Administrator') {
    const response = await apiClient(`/api/admin/users/${userId}/deactivate`, {
      method: 'PATCH',
      body: JSON.stringify({ administrator: adminName }),
    });
    return response.data;
  },

  /**
   * Activate a user
   */
  async activateUser(userId, adminName = 'Administrator') {
    const response = await apiClient(`/api/admin/users/${userId}/activate`, {
      method: 'PATCH',
      body: JSON.stringify({ administrator: adminName }),
    });
    return response.data;
  },

  /**
   * Permanently delete a user
   */
  async deleteUser(userId, adminName = 'Administrator') {
    await apiClient(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ administrator: adminName }),
    });
    return { success: true };
  },

  /**
   * Fetch audit logs
   */
  async getAuditLogs() {
    const response = await apiClient('/api/admin/audit-logs');
    return Array.isArray(response?.data) ? response.data : [];
  },

  /**
   * Add entry to audit log
   */
  async logAction(actionDetails) {
    try {
      const response = await apiClient('/api/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify(actionDetails),
      });
      return response.data;
    } catch {
      return {
        id: `AUD-${Date.now()}`,
        timestamp: 'Just now',
        rawDate: new Date().toISOString(),
        ...actionDetails,
      };
    }
  },

  /**
   * Get system health & diagnostics
   */
  async getSystemStatus() {
    const response = await apiClient('/api/admin/system-status');
    return response?.data || null;
  }
};
