const { ROLES } = require('../constants/roles');

const getConfiguredUsers = () => ({
  [ROLES.ADMIN]: {
    email: String(process.env.ADMIN_EMAIL || 'admin@peoplepay360.com').trim().toLowerCase(),
    password: String(process.env.ADMIN_PASSWORD || 'Admin123!'),
  },
  [ROLES.HR_MANAGER]: {
    email: String(process.env.HR_MANAGER_EMAIL || 'hr.manager@peoplepay360.com').trim().toLowerCase(),
    password: String(process.env.HR_MANAGER_PASSWORD || 'Password123!'),
  },
  [ROLES.HR_PAYROLL_MANAGER]: {
    email: String(
      process.env.HR_PAYROLL_MANAGER_EMAIL || 'payroll.manager@peoplepay360.local'
    )
      .trim()
      .toLowerCase(),
    password: String(process.env.HR_PAYROLL_MANAGER_PASSWORD || 'PayrollManager123!'),
  },
  [ROLES.HR_PAYROLL_USER]: {
    email: String(process.env.HR_PAYROLL_USER_EMAIL || 'payroll.user@peoplepay360.local')
      .trim()
      .toLowerCase(),
    password: String(process.env.HR_PAYROLL_USER_PASSWORD || 'PayrollUser123!'),
  },
  [ROLES.EMPLOYEE]: {
    email: String(process.env.EMPLOYEE_EMAIL || 'employee@peoplepay360.com').trim().toLowerCase(),
    password: String(process.env.EMPLOYEE_PASSWORD || 'Employee123!'),
    employeeCode: String(process.env.EMPLOYEE_CODE || '').trim().toUpperCase(),
  },
});

module.exports = {
  getConfiguredUsers,
};
