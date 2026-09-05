const ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageEmployees: true,
    canManageAttendance: true,
    canManageContracts: true,
    canManageSchedules: true,
    canManageTimeOff: true,
    canApproveTimeOff: true,
    canAccessPayroll: true,
    canManageUsers: true,
    canManageSystem: true,
    canViewOwnProfile: true,
    canViewOwnAttendance: true,
    canCreateOwnAttendance: true,
    canViewOwnLeaveBalances: true,
    canCreateOwnTimeOffRequests: true,
  },
  [ROLES.HR_MANAGER]: {
    canManageEmployees: true,
    canManageAttendance: true,
    canManageContracts: true,
    canManageSchedules: true,
    canManageTimeOff: true,
    canApproveTimeOff: true,
    canAccessPayroll: false,
    canManageUsers: false,
    canManageSystem: false,
    canViewOwnProfile: true,
    canViewOwnAttendance: true,
    canCreateOwnAttendance: true,
    canViewOwnLeaveBalances: true,
    canCreateOwnTimeOffRequests: true,
  },
  [ROLES.EMPLOYEE]: {
    canManageEmployees: false,
    canManageAttendance: false,
    canManageContracts: false,
    canManageSchedules: false,
    canManageTimeOff: false,
    canApproveTimeOff: false,
    canAccessPayroll: false,
    canManageUsers: false,
    canManageSystem: false,
    canViewOwnProfile: true,
    canViewOwnAttendance: true,
    canCreateOwnAttendance: true,
    canViewOwnLeaveBalances: true,
    canCreateOwnTimeOffRequests: true,
  },
};

const getPermissionsForRole = (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.EMPLOYEE];

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
};
