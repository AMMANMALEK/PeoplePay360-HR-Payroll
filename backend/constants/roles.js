const ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
  HR_PAYROLL_USER: 'HR_PAYROLL_USER',
  EMPLOYEE: 'EMPLOYEE',
};

const ALL_ROLES = Object.values(ROLES);

const SELF_SERVICE = {
  canViewOwnProfile: true,
  canViewOwnAttendance: true,
  canCreateOwnAttendance: true,
  canViewOwnLeaveBalances: true,
  canCreateOwnTimeOffRequests: true,
};

const HR_MANAGER_OPS = {
  canManageEmployees: true,
  canManageAttendance: true,
  canManageContracts: true,
  canManageSchedules: true,
  canManageTimeOff: true,
  canApproveTimeOff: true,
};

const NO_GOVERNANCE = {
  canManageUsers: false,
  canManageSystem: false,
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    ...HR_MANAGER_OPS,
    canAccessPayroll: true,
    canManagePayroll: true,
    canComputePayrun: true,
    canValidatePayrun: true,
    canManageSalaryConfig: true,
    canDeletePayrun: true,
    canDeletePayslip: true,
    canUpdatePayslip: true,
    canManageUsers: true,
    canManageSystem: true,
    ...SELF_SERVICE,
  },
  [ROLES.HR_PAYROLL_MANAGER]: {
    ...HR_MANAGER_OPS,
    canAccessPayroll: true,
    canManagePayroll: true,
    canComputePayrun: true,
    canValidatePayrun: true,
    canManageSalaryConfig: true,
    canDeletePayrun: true,
    canDeletePayslip: true,
    canUpdatePayslip: true,
    ...NO_GOVERNANCE,
    ...SELF_SERVICE,
  },
  [ROLES.HR_PAYROLL_USER]: {
    ...HR_MANAGER_OPS,
    canAccessPayroll: true,
    canManagePayroll: false,
    canComputePayrun: true,
    canValidatePayrun: false,
    canManageSalaryConfig: false,
    canDeletePayrun: false,
    canDeletePayslip: false,
    canUpdatePayslip: true,
    ...NO_GOVERNANCE,
    ...SELF_SERVICE,
  },
  [ROLES.HR_MANAGER]: {
    ...HR_MANAGER_OPS,
    canAccessPayroll: false,
    canManagePayroll: false,
    canComputePayrun: false,
    canValidatePayrun: false,
    canManageSalaryConfig: false,
    canDeletePayrun: false,
    canDeletePayslip: false,
    canUpdatePayslip: false,
    ...NO_GOVERNANCE,
    ...SELF_SERVICE,
  },
  [ROLES.EMPLOYEE]: {
    canManageEmployees: false,
    canManageAttendance: false,
    canManageContracts: false,
    canManageSchedules: false,
    canManageTimeOff: false,
    canApproveTimeOff: false,
    canAccessPayroll: false,
    canManagePayroll: false,
    canComputePayrun: false,
    canValidatePayrun: false,
    canManageSalaryConfig: false,
    canDeletePayrun: false,
    canDeletePayslip: false,
    canUpdatePayslip: false,
    ...NO_GOVERNANCE,
    ...SELF_SERVICE,
  },
};

const getPermissionsForRole = (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.EMPLOYEE];

module.exports = {
  ROLES,
  ALL_ROLES,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
};
