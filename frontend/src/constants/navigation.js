export const ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const APP_ROLE = {
  name: "HR Manager",
  code: ROLES.HR_MANAGER,
  permissions: {
    canManageEmployees: true,
    canManageAttendance: true,
    canManageContracts: true,
    canManageSchedules: true,
    canManageTimeOff: true,
    canApproveTimeOff: true,
    canAccessPayroll: false // Strictly forbidden for HR Manager role
  }
};

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
    description: "Daily HR operational summary & attention items"
  },
  {
    label: "Employees",
    path: "/employees",
    icon: "Users",
    description: "Employee directory, profiles & organizational hub",
    badgeKey: "totalEmployees"
  },
  {
    label: "Attendance",
    path: "/attendance",
    icon: "Clock",
    description: "Daily attendance logs, status & manual corrections",
    badgeKey: "attendanceExceptions"
  },
  {
    label: "Contracts",
    path: "/contracts",
    icon: "FileText",
    description: "Active terms, renewals & contract lifecycle"
  },
  {
    label: "Working Schedules",
    path: "/schedules",
    icon: "CalendarDays",
    description: "Shift patterns & weekly working hours"
  },
  {
    label: "Time Off",
    path: "/time-off",
    icon: "CalendarCheck",
    description: "Leave requests, approval workflows & balances",
    badgeKey: "pendingTimeOff"
  }
];

export const ADMIN_APP_ROLE = {
  name: "System Administrator",
  code: ROLES.ADMIN,
  permissions: {
    canManageUsers: true,
    canManageRoles: true,
    canViewAuditLogs: true,
    canViewSystemStatus: true,
  },
};

export const ADMIN_NAV_ITEMS = [
  {
    label: "Overview",
    path: "/admin",
    icon: "LayoutDashboard",
    description: "Platform snapshot & access governance",
  },
  {
    label: "Departments & Positions",
    path: "/admin/departments",
    icon: "Building2",
    description: "Manage organizational departments and job positions",
  },
  {
    label: "HR Governance",
    path: "/admin/hr-governance",
    icon: "CalendarCheck",
    description: "Approve HR Manager leaves & adjust check-in/out timings",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: "Users",
    description: "Manage system user accounts & access",
  },
  {
    label: "Roles & Permissions",
    path: "/admin/roles",
    icon: "KeyRound",
    description: "RBAC roles and granular permission sets",
  },
  {
    label: "System Status",
    path: "/admin/system",
    icon: "Activity",
    description: "Platform health and module uptime",
  },
  {
    label: "Audit Logs",
    path: "/admin/audit",
    icon: "Shield",
    description: "Security and administrative audit trail",
  },
];
