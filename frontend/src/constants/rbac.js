/**
 * PeoplePay360 Centralized Role-Based Access Control (RBAC) Architecture
 * 
 * Source of Truth for Platform Roles, Modules, and Action Capabilities.
 * Any role check or permission summary across the UI is derived from this single engine.
 */

export const PLATFORM_ROLES = {
  EMPLOYEE: {
    code: 'EMPLOYEE',
    name: 'Employee',
    badge: 'EMP',
    scope: 'My Work',
    description: 'Self-service workforce portal for viewing personal profile, shift schedule, clocking daily attendance, and submitting leave requests.',
    color: 'slate',
    userCount: 14
  },
  HR_MANAGER: {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    badge: 'HR',
    scope: 'Manage People',
    description: 'Workforce administration, employee record management, contract renewals, attendance approvals, and company leave allocations.',
    color: 'indigo',
    userCount: 4
  },
  HR_PAYROLL_USER: {
    code: 'HR_PAYROLL_USER',
    name: 'HR Payroll User',
    badge: 'HPU',
    scope: 'HR + Payroll Operations',
    description: 'All HR Manager permissions plus create, read, and update on payruns and payslips. Salary structures and salary rules are read-only.',
    color: 'blue',
    userCount: 3
  },
  HR_PAYROLL_MANAGER: {
    code: 'HR_PAYROLL_MANAGER',
    name: 'HR Payroll Manager',
    badge: 'HRP',
    scope: 'HR & Payroll Command',
    description: 'All HR Payroll User permissions with full CRUD on payruns, payslips, salary structures, and salary rules, plus full control of HR and payroll configuration.',
    color: 'purple',
    userCount: 2
  },
  ADMIN: {
    code: 'ADMIN',
    name: 'Admin',
    badge: 'ADM',
    scope: 'Control the Platform',
    description: 'Highest-privilege platform administrator with full governance over user access, role assignments, security policies, and system configuration.',
    color: 'emerald',
    userCount: 1
  }
};

export const MODULES = {
  EMPLOYEES: {
    id: 'employees',
    label: 'Employees',
    category: 'Workforce',
    description: 'Employee directory, personal profiles & organizational hierarchy'
  },
  ATTENDANCE: {
    id: 'attendance',
    label: 'Attendance',
    category: 'Workforce',
    description: 'Daily shift attendance tracking, badge logs, and manual time corrections'
  },
  CONTRACTS: {
    id: 'contracts',
    label: 'Contracts',
    category: 'Workforce',
    description: 'Employment agreements, wage terms, renewals, and active durations'
  },
  SCHEDULES: {
    id: 'schedules',
    label: 'Working Schedules',
    category: 'Workforce',
    description: 'Standard work schedules, compressed weeks, and shift day templates'
  },
  TIME_OFF: {
    id: 'timeOff',
    label: 'Time Off',
    category: 'Workforce',
    description: 'Leave requests, quota allocations, approval workflows, and leave balances'
  },
  PAYRUNS: {
    id: 'payruns',
    label: 'Payruns',
    category: 'Payroll',
    description: 'Batch payroll execution, salary rule processing, validation & payment'
  },
  PAYSLIPS: {
    id: 'payslips',
    label: 'Payslips',
    category: 'Payroll',
    description: 'Individual employee wage statements, earnings, deductions, and bank receipts'
  },
  SALARY_STRUCTURES: {
    id: 'salaryStructures',
    label: 'Salary Structures',
    category: 'Payroll',
    description: 'Salary templates and compensation rule execution order'
  },
  SALARY_RULES: {
    id: 'salaryRules',
    label: 'Salary Rules',
    category: 'Payroll',
    description: 'Dynamic compensation computation formulas, allowances, and tax deductions'
  },
  REPORTS: {
    id: 'reports',
    label: 'Reports',
    category: 'Analytics',
    description: 'Workforce metrics, payroll summaries, and operational analytics'
  },
  USERS: {
    id: 'users',
    label: 'Users',
    category: 'Governance',
    description: 'Platform user accounts, credentials, status, and department affiliations'
  },
  ROLES: {
    id: 'roles',
    label: 'Roles & Permissions',
    category: 'Governance',
    description: 'Role definitions, granular module rights, and access control policies'
  },
  AUDIT_LOG: {
    id: 'auditLog',
    label: 'Audit Log',
    category: 'System',
    description: 'Historical audit trail of all administrative and security actions'
  },
  SYSTEM_ADMIN: {
    id: 'systemAdmin',
    label: 'System Administration',
    category: 'System',
    description: 'Platform environment settings, security enforcement, and subsystem status'
  }
};

export const ACTIONS = ['create', 'read', 'update', 'delete'];

/**
 * Granular Matrix of Allowed Actions per Role and Module
 */
export const ROLE_PERMISSIONS_MATRIX = {
  EMPLOYEE: {
    employees: ['read'],
    attendance: ['create', 'read'],
    contracts: ['read'],
    schedules: ['read'],
    timeOff: ['create', 'read'],
    payruns: [],
    payslips: ['read'],
    salaryStructures: [],
    salaryRules: [],
    reports: [],
    users: [],
    roles: [],
    auditLog: [],
    systemAdmin: []
  },
  HR_MANAGER: {
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update'],
    contracts: ['create', 'read', 'update'],
    schedules: ['create', 'read', 'update', 'delete'],
    timeOff: ['read', 'update', 'delete'],
    payruns: [],
    payslips: [],
    salaryStructures: [],
    salaryRules: [],
    reports: ['read'],
    users: [],
    roles: [],
    auditLog: [],
    systemAdmin: []
  },
  HR_PAYROLL_USER: {
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update'],
    contracts: ['create', 'read', 'update'],
    schedules: ['create', 'read', 'update', 'delete'],
    timeOff: ['read', 'update', 'delete'],
    payruns: ['create', 'read', 'update'],
    payslips: ['create', 'read', 'update'],
    salaryStructures: ['read'],
    salaryRules: ['read'],
    reports: ['read'],
    users: [],
    roles: [],
    auditLog: [],
    systemAdmin: []
  },
  HR_PAYROLL_MANAGER: {
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    contracts: ['create', 'read', 'update', 'delete'],
    schedules: ['create', 'read', 'update', 'delete'],
    timeOff: ['create', 'read', 'update', 'delete'],
    payruns: ['create', 'read', 'update', 'delete'],
    payslips: ['create', 'read', 'update', 'delete'],
    salaryStructures: ['create', 'read', 'update', 'delete'],
    salaryRules: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read'],
    users: [],
    roles: [],
    auditLog: [],
    systemAdmin: []
  },
  ADMIN: {
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    contracts: ['create', 'read', 'update', 'delete'],
    schedules: ['create', 'read', 'update', 'delete'],
    timeOff: ['create', 'read', 'update', 'delete'],
    payruns: ['create', 'read', 'update', 'delete'],
    payslips: ['create', 'read', 'update', 'delete'],
    salaryStructures: ['create', 'read', 'update', 'delete'],
    salaryRules: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    roles: ['create', 'read', 'update', 'delete'],
    auditLog: ['read'],
    systemAdmin: ['create', 'read', 'update', 'delete']
  }
};

/**
 * Check if a role has permission for an action on a module
 */
export function hasPermission(roleCode, moduleId, action = 'read') {
  if (!roleCode || !moduleId) return false;
  const normalizedRole = roleCode.toUpperCase();
  const permissions = ROLE_PERMISSIONS_MATRIX[normalizedRole];
  if (!permissions) return false;
  const moduleActions = permissions[moduleId] || [];
  return moduleActions.includes(action.toLowerCase());
}

/**
 * Check if a role can access (read) a module
 */
export function canAccess(roleCode, moduleId) {
  return hasPermission(roleCode, moduleId, 'read');
}

export function canCreate(roleCode, moduleId) {
  return hasPermission(roleCode, moduleId, 'create');
}

export function canUpdate(roleCode, moduleId) {
  return hasPermission(roleCode, moduleId, 'update');
}

export function canDelete(roleCode, moduleId) {
  return hasPermission(roleCode, moduleId, 'delete');
}

/**
 * Return human-readable access summary for User Profile cards
 */
export function getRoleAccessSummary(roleCode) {
  const normalized = roleCode?.toUpperCase();
  return [
    {
      name: 'HR Management',
      description: 'Employee records, shift patterns & leave workflows',
      granted: hasPermission(normalized, 'employees', 'read') && hasPermission(normalized, 'timeOff', 'update')
    },
    {
      name: 'Payroll Management',
      description: 'Payruns, payslips generation & batch disbursements',
      granted: hasPermission(normalized, 'payruns', 'read')
    },
    {
      name: 'Salary Configuration',
      description: 'Salary structures, rule sequences & formula builders',
      granted: hasPermission(normalized, 'salaryStructures', 'update')
    },
    {
      name: 'User Management',
      description: 'Create, update, deactivate platform users & role assignments',
      granted: hasPermission(normalized, 'users', 'create')
    },
    {
      name: 'System Administration',
      description: 'Security policies, module audit logs & system health',
      granted: hasPermission(normalized, 'systemAdmin', 'read')
    }
  ];
}

/**
 * Calculate total configured permissions across the platform
 */
export function getTotalPermissionsCount() {
  let count = 0;
  Object.values(ROLE_PERMISSIONS_MATRIX).forEach((roleObj) => {
    Object.values(roleObj).forEach((actions) => {
      count += actions.length;
    });
  });
  return count; // 86 configured permissions
}

/**
 * Returns structured rows and columns for the Permission Matrix view
 */
export function getPermissionMatrix() {
  const roles = Object.values(PLATFORM_ROLES);
  const modules = Object.values(MODULES);

  return modules.map((mod) => {
    const rolePermissions = {};
    roles.forEach((role) => {
      const allowedActions = ROLE_PERMISSIONS_MATRIX[role.code]?.[mod.id] || [];
      rolePermissions[role.code] = {
        canCreate: allowedActions.includes('create'),
        canRead: allowedActions.includes('read'),
        canUpdate: allowedActions.includes('update'),
        canDelete: allowedActions.includes('delete'),
        actions: allowedActions
      };
    });

    return {
      module: mod,
      permissions: rolePermissions
    };
  });
}
