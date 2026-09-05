/**
 * PeoplePay360 Admin & RBAC Service Layer
 * 
 * Manages Platform Users, Audit Trails, and System Health.
 * Follows enterprise architecture: React UI -> Hooks / Context -> Service Layer -> API Layer.
 */

const API_BASE_URL = ''; // Empty placeholder per Section 19

let mockUsers = [];

let mockAuditLogs = [];

// System Status and Subsystems
const systemStatus = {
  overall: 'Healthy',
  modules: [
    { name: 'HR Management', status: 'Operational', latency: '24ms', uptime: '99.98%' },
    { name: 'Attendance Service', status: 'Operational', latency: '31ms', uptime: '99.95%' },
    { name: 'Time Off Registry', status: 'Operational', latency: '19ms', uptime: '100.0%' },
    { name: 'Payroll Engine', status: 'Operational', latency: '42ms', uptime: '99.99%' },
    { name: 'Reports & Analytics', status: 'Operational', latency: '38ms', uptime: '99.94%' }
  ],
  environment: {
    appVersion: 'PeoplePay360 v2.4.0 (Hackathon Enterprise Edition)',
    nodeEnv: 'production-ready',
    authPolicy: 'Role-Based Access Control (RBAC Level 3)',
    encryption: 'AES-256 GCM at rest · TLS 1.3 in transit',
    databaseState: 'Read-write replica synchrony active'
  }
};

export const adminService = {
  /**
   * Fetch all users
   */
  async getUsers() {
    return Promise.resolve([...mockUsers]);
  },

  /**
   * Create a new platform user
   */
  async createUser(userData, adminName = 'Administrator') {
    const newId = `USR-0${mockUsers.length + 1}`;
    const initials = userData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'EMPLOYEE',
      roleName: userData.role?.replace(/_/g, ' ') || 'Employee',
      department: userData.department || 'General',
      status: userData.status || 'Active',
      lastActive: 'Never logged in',
      createdAt: new Date().toISOString().split('T')[0],
      avatarInitials: initials || 'US'
    };

    mockUsers = [newUser, ...mockUsers];

    // Log admin action
    this.logAction({
      administrator: adminName,
      action: 'User created',
      module: 'Users',
      target: `${newUser.name} (${newUser.role})`,
      status: 'Success',
      severity: 'info'
    });

    return Promise.resolve(newUser);
  },

  /**
   * Update an existing user
   */
  async updateUser(userId, updates, adminName = 'Administrator') {
    mockUsers = mockUsers.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          ...updates,
          avatarInitials: updates.name
            ? updates.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
            : u.avatarInitials
        };
      }
      return u;
    });

    this.logAction({
      administrator: adminName,
      action: 'User updated',
      module: 'Users',
      target: `${updates.name || userId} profile modified`,
      status: 'Success',
      severity: 'info'
    });

    return Promise.resolve(mockUsers.find((u) => u.id === userId));
  },

  /**
   * Change user role with explicit audit tracking
   */
  async changeUserRole(userId, newRoleCode, adminName = 'Administrator') {
    let targetUser = mockUsers.find((u) => u.id === userId);
    if (!targetUser) throw new Error('User not found');

    const previousRole = targetUser.role;
    targetUser = {
      ...targetUser,
      role: newRoleCode,
      roleName: newRoleCode.replace(/_/g, ' ')
    };

    mockUsers = mockUsers.map((u) => (u.id === userId ? targetUser : u));

    // Create prominent audit log event
    this.logAction({
      administrator: adminName,
      action: 'Role changed',
      module: 'Users',
      target: `${targetUser.name} (${previousRole} → ${newRoleCode})`,
      status: 'Success',
      severity: 'info'
    });

    return Promise.resolve(targetUser);
  },

  /**
   * Deactivate a user
   */
  async deactivateUser(userId, adminName = 'Administrator') {
    let targetUser = mockUsers.find((u) => u.id === userId);
    if (!targetUser) throw new Error('User not found');

    targetUser = { ...targetUser, status: 'Inactive' };
    mockUsers = mockUsers.map((u) => (u.id === userId ? targetUser : u));

    this.logAction({
      administrator: adminName,
      action: 'User deactivated',
      module: 'Users',
      target: `${targetUser.name} (${targetUser.email})`,
      status: 'Success',
      severity: 'warning'
    });

    return Promise.resolve(targetUser);
  },

  /**
   * Activate a user
   */
  async activateUser(userId, adminName = 'Administrator') {
    let targetUser = mockUsers.find((u) => u.id === userId);
    if (!targetUser) throw new Error('User not found');

    targetUser = { ...targetUser, status: 'Active' };
    mockUsers = mockUsers.map((u) => (u.id === userId ? targetUser : u));

    this.logAction({
      administrator: adminName,
      action: 'User activated',
      module: 'Users',
      target: `${targetUser.name} (${targetUser.email})`,
      status: 'Success',
      severity: 'info'
    });

    return Promise.resolve(targetUser);
  },

  /**
   * Permanently delete a user
   */
  async deleteUser(userId, adminName = 'Administrator') {
    const targetUser = mockUsers.find((u) => u.id === userId);
    if (!targetUser) throw new Error('User not found');

    mockUsers = mockUsers.filter((u) => u.id !== userId);

    this.logAction({
      administrator: adminName,
      action: 'User permanently deleted',
      module: 'Users',
      target: `${targetUser.name} (${targetUser.email})`,
      status: 'Success',
      severity: 'error'
    });

    return Promise.resolve(targetUser);
  },

  /**
   * Fetch audit logs
   */
  async getAuditLogs() {
    return Promise.resolve([...mockAuditLogs]);
  },

  /**
   * Add entry to audit log
   */
  logAction({ administrator = 'Administrator', action, module, target, status = 'Success', severity = 'info' }) {
    const newLog = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      rawDate: new Date().toISOString(),
      administrator,
      action,
      module,
      target,
      status,
      severity
    };
    mockAuditLogs = [newLog, ...mockAuditLogs];
    return newLog;
  },

  /**
   * Get system health & diagnostics
   */
  async getSystemStatus() {
    return Promise.resolve({ ...systemStatus });
  }
};
