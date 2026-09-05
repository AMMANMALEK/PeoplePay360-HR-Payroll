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
