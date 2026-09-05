const { ROLES } = require('../constants/roles');

const getConfiguredUsers = () => ({
  [ROLES.HR_MANAGER]: {
    email: String(process.env.HR_MANAGER_EMAIL || '').trim().toLowerCase(),
    password: String(process.env.HR_MANAGER_PASSWORD || ''),
  },
  [ROLES.EMPLOYEE]: {
    email: String(process.env.EMPLOYEE_EMAIL || '').trim().toLowerCase(),
    password: String(process.env.EMPLOYEE_PASSWORD || ''),
    employeeCode: String(process.env.EMPLOYEE_CODE || '').trim().toUpperCase(),
  },
});

module.exports = {
  getConfiguredUsers,
};
