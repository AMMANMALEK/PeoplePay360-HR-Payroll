export const APP_ROLE = {
  name: "HR Payroll User",
  code: "HR_PAYROLL_USER",
  permissions: {
    canManageEmployees: true,
    canManageAttendance: true,
    canManageContracts: true,
    canManageSchedules: true,
    canManageTimeOff: true,
    canApproveTimeOff: true,
    canAccessPayroll: true,
    canManagePayruns: true,
    canManagePayslips: true,
    canViewSalaryStructures: true,
    canViewSalaryRules: true,
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
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "BarChart3",
    description: "Operational HR workforce metrics",
    isSecondary: true
  }
];

export const PAYROLL_NAV_ITEMS = [
  {
    label: "Payroll Overview",
    path: "/payroll/dashboard",
    icon: "BadgeDollarSign",
    description: "Payroll KPIs, alerts & distribution summaries"
  },
  {
    label: "Payruns",
    path: "/payroll/payruns",
    icon: "Calculator",
    description: "Create, compute, validate & execute payruns"
  },
  {
    label: "Payslips",
    path: "/payroll/payslips",
    icon: "Receipt",
    description: "Generated employee payslips & breakdown details"
  },
  {
    label: "Salary Structures",
    path: "/payroll/salary-structures",
    icon: "Layers",
    description: "Structure definitions & assigned rule sequences"
  },
  {
    label: "Salary Rules",
    path: "/payroll/salary-rules",
    icon: "Sliders",
    description: "Calculation rules, formulas & categories"
  }
];
