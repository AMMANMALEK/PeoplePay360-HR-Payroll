/**
 * PeoplePay360 Admin & RBAC Service Layer
 * 
 * Manages Platform Users, Audit Trails, and System Health.
 * Follows enterprise architecture: React UI -> Hooks / Context -> Service Layer -> API Layer.
 */

const API_BASE_URL = ''; // Empty placeholder per Section 19

// Initial 24 Platform Users (22 Active, 2 Inactive)
let mockUsers = [
  {
    id: 'USR-001',
    name: 'Marcus Vance',
    email: 'marcus.vance@peoplepay360.internal',
    role: 'ADMIN',
    roleName: 'Admin',
    department: 'Executive',
    status: 'Active',
    lastActive: 'Just now',
    createdAt: '2025-01-10',
    avatarInitials: 'MV'
  },
  {
    id: 'USR-002',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@peoplepay360.internal',
    role: 'HR_PAYROLL_MANAGER',
    roleName: 'HR Payroll Manager',
    department: 'Human Resources',
    status: 'Active',
    lastActive: 'Today, 10:45 AM',
    createdAt: '2025-01-12',
    avatarInitials: 'SJ'
  },
  {
    id: 'USR-003',
    name: 'David Kim',
    email: 'david.kim@peoplepay360.internal',
    role: 'HR_MANAGER',
    roleName: 'HR Manager',
    department: 'Human Resources',
    status: 'Active',
    lastActive: 'Today, 09:30 AM',
    createdAt: '2025-01-15',
    avatarInitials: 'DK'
  },
  {
    id: 'USR-004',
    name: 'Elena Rostova',
    email: 'elena.rostova@peoplepay360.internal',
    role: 'HR_PAYROLL_USER',
    roleName: 'HR Payroll User',
    department: 'Finance',
    status: 'Active',
    lastActive: 'Yesterday',
    createdAt: '2025-01-18',
    avatarInitials: 'ER'
  },
  {
    id: 'USR-005',
    name: 'Michael Chen',
    email: 'michael.chen@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Engineering',
    status: 'Active',
    lastActive: 'Today, 08:15 AM',
    createdAt: '2025-02-01',
    avatarInitials: 'MC'
  },
  {
    id: 'USR-006',
    name: 'Amara Patel',
    email: 'amara.patel@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Engineering',
    status: 'Active',
    lastActive: 'Today, 11:20 AM',
    createdAt: '2025-02-02',
    avatarInitials: 'AP'
  },
  {
    id: 'USR-007',
    name: 'James Rodriguez',
    email: 'james.rodriguez@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Engineering',
    status: 'Active',
    lastActive: '2 days ago',
    createdAt: '2025-02-03',
    avatarInitials: 'JR'
  },
  {
    id: 'USR-008',
    name: 'Olivia Martinez',
    email: 'olivia.martinez@peoplepay360.internal',
    role: 'HR_MANAGER',
    roleName: 'HR Manager',
    department: 'Human Resources',
    status: 'Active',
    lastActive: 'Today, 01:10 PM',
    createdAt: '2025-02-05',
    avatarInitials: 'OM'
  },
  {
    id: 'USR-009',
    name: 'Lucas Dupont',
    email: 'lucas.dupont@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Product',
    status: 'Active',
    lastActive: 'Yesterday',
    createdAt: '2025-02-08',
    avatarInitials: 'LD'
  },
  {
    id: 'USR-010',
    name: 'Chloe Zhao',
    email: 'chloe.zhao@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Design',
    status: 'Active',
    lastActive: 'Today, 02:00 PM',
    createdAt: '2025-02-10',
    avatarInitials: 'CZ'
  },
  {
    id: 'USR-011',
    name: 'Siddharth Nair',
    email: 'siddharth.nair@peoplepay360.internal',
    role: 'HR_PAYROLL_USER',
    roleName: 'HR Payroll User',
    department: 'Finance',
    status: 'Active',
    lastActive: 'Today, 10:00 AM',
    createdAt: '2025-02-12',
    avatarInitials: 'SN'
  },
  {
    id: 'USR-012',
    name: 'Rachel Green',
    email: 'rachel.green@peoplepay360.internal',
    role: 'HR_PAYROLL_MANAGER',
    roleName: 'HR Payroll Manager',
    department: 'Finance',
    status: 'Active',
    lastActive: 'Today, 03:22 PM',
    createdAt: '2025-02-14',
    avatarInitials: 'RG'
  },
  {
    id: 'USR-013',
    name: 'Daniel Brooks',
    email: 'daniel.brooks@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Marketing',
    status: 'Active',
    lastActive: '3 days ago',
    createdAt: '2025-02-15',
    avatarInitials: 'DB'
  },
  {
    id: 'USR-014',
    name: 'Sophia Al-Mansoor',
    email: 'sophia.almansoor@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Operations',
    status: 'Active',
    lastActive: 'Yesterday',
    createdAt: '2025-02-18',
    avatarInitials: 'SA'
  },
  {
    id: 'USR-015',
    name: 'Benjamin Taylor',
    email: 'benjamin.taylor@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Engineering',
    status: 'Active',
    lastActive: 'Today, 11:40 AM',
    createdAt: '2025-02-20',
    avatarInitials: 'BT'
  },
  {
    id: 'USR-016',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Customer Success',
    status: 'Active',
    lastActive: 'Today, 09:05 AM',
    createdAt: '2025-02-22',
    avatarInitials: 'FZ'
  },
  {
    id: 'USR-017',
    name: 'Hannah Abbott',
    email: 'hannah.abbott@peoplepay360.internal',
    role: 'HR_MANAGER',
    roleName: 'HR Manager',
    department: 'Human Resources',
    status: 'Active',
    lastActive: '4 days ago',
    createdAt: '2025-02-24',
    avatarInitials: 'HA'
  },
  {
    id: 'USR-018',
    name: 'Victor Vance',
    email: 'victor.vance@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Legal',
    status: 'Active',
    lastActive: 'Yesterday',
    createdAt: '2025-02-25',
    avatarInitials: 'VV'
  },
  {
    id: 'USR-019',
    name: 'Kavita Rao',
    email: 'kavita.rao@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Engineering',
    status: 'Active',
    lastActive: 'Today, 08:30 AM',
    createdAt: '2025-02-26',
    avatarInitials: 'KR'
  },
  {
    id: 'USR-020',
    name: 'Ethan Cole',
    email: 'ethan.cole@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Sales',
    status: 'Active',
    lastActive: 'Today, 12:15 PM',
    createdAt: '2025-02-27',
    avatarInitials: 'EC'
  },
  {
    id: 'USR-021',
    name: 'Maya Lin',
    email: 'maya.lin@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Product',
    status: 'Active',
    lastActive: '2 days ago',
    createdAt: '2025-02-28',
    avatarInitials: 'ML'
  },
  {
    id: 'USR-022',
    name: 'Arthur Pendelton',
    email: 'arthur.pendelton@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Executive',
    status: 'Active',
    lastActive: 'Today, 01:45 PM',
    createdAt: '2025-03-01',
    avatarInitials: 'AP'
  },
  {
    id: 'USR-023',
    name: 'Gregory House',
    email: 'gregory.house@peoplepay360.internal',
    role: 'EMPLOYEE',
    roleName: 'Employee',
    department: 'Human Resources',
    status: 'Inactive',
    lastActive: '14 days ago',
    createdAt: '2025-01-05',
    avatarInitials: 'GH'
  },
  {
    id: 'USR-024',
    name: 'Jessica Pearson',
    email: 'jessica.pearson@peoplepay360.internal',
    role: 'HR_PAYROLL_USER',
    roleName: 'HR Payroll User',
    department: 'Finance',
    status: 'Inactive',
    lastActive: '28 days ago',
    createdAt: '2025-01-08',
    avatarInitials: 'JP'
  }
];

// Initial Audit Log History
let mockAuditLogs = [
  {
    id: 'AUD-901',
    timestamp: 'Today, 10:24 AM',
    rawDate: new Date().toISOString(),
    administrator: 'Marcus Vance',
    action: 'Role changed',
    module: 'Users',
    target: 'Sarah Jenkins (HR Manager → HR Payroll Manager)',
    status: 'Success',
    severity: 'info'
  },
  {
    id: 'AUD-902',
    timestamp: 'Today, 10:18 AM',
    rawDate: new Date(Date.now() - 6 * 60000).toISOString(),
    administrator: 'Marcus Vance',
    action: 'Permission updated',
    module: 'Roles',
    target: 'HR Payroll User (Payrun validation rights)',
    status: 'Success',
    severity: 'info'
  },
  {
    id: 'AUD-903',
    timestamp: 'Today, 09:55 AM',
    rawDate: new Date(Date.now() - 29 * 60000).toISOString(),
    administrator: 'Marcus Vance',
    action: 'User activated',
    module: 'Users',
    target: 'David Kim (USR-003)',
    status: 'Success',
    severity: 'info'
  },
  {
    id: 'AUD-904',
    timestamp: 'Yesterday, 04:30 PM',
    rawDate: new Date(Date.now() - 86400000).toISOString(),
    administrator: 'Marcus Vance',
    action: 'Configuration updated',
    module: 'System Administration',
    target: 'Session timeout policy set to 60 minutes',
    status: 'Success',
    severity: 'info'
  },
  {
    id: 'AUD-905',
    timestamp: 'Yesterday, 02:15 PM',
    rawDate: new Date(Date.now() - 94000000).toISOString(),
    administrator: 'Marcus Vance',
    action: 'User deactivated',
    module: 'Users',
    target: 'Jessica Pearson (USR-024)',
    status: 'Success',
    severity: 'warning'
  },
  {
    id: 'AUD-906',
    timestamp: '2 days ago',
    rawDate: new Date(Date.now() - 172800000).toISOString(),
    administrator: 'Marcus Vance',
    action: 'Security policy updated',
    module: 'System Administration',
    target: 'Strict salary validation enforcement enabled',
    status: 'Success',
    severity: 'info'
  }
];

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
  async createUser(userData, adminName = 'Marcus Vance') {
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
  async updateUser(userId, updates, adminName = 'Marcus Vance') {
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
  async changeUserRole(userId, newRoleCode, adminName = 'Marcus Vance') {
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
  async deactivateUser(userId, adminName = 'Marcus Vance') {
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
  async activateUser(userId, adminName = 'Marcus Vance') {
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
  async deleteUser(userId, adminName = 'Marcus Vance') {
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
  logAction({ administrator = 'Marcus Vance', action, module, target, status = 'Success', severity = 'info' }) {
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
