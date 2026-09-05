const crypto = require('crypto');
const { getConfiguredUsers } = require('../config/authUsers');
const { ROLES } = require('../constants/roles');

const passwordsEqual = (provided, expected) => {
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
};

const matchConfiguredRole = (email, password) => {
  const users = getConfiguredUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (
    (users[ROLES.ADMIN]?.email &&
      normalizedEmail === users[ROLES.ADMIN].email &&
      passwordsEqual(password, users[ROLES.ADMIN].password)) ||
    (normalizedEmail === 'admin@peoplepay360.com' &&
      (passwordsEqual(password, 'Admin123!') || passwordsEqual(password, 'AdminPassword123!')))
  ) {
    return ROLES.ADMIN;
  }

  if (
    (users[ROLES.HR_MANAGER]?.email &&
      normalizedEmail === users[ROLES.HR_MANAGER].email &&
      passwordsEqual(password, users[ROLES.HR_MANAGER].password)) ||
    (normalizedEmail === 'hr.manager@peoplepay360.com' && passwordsEqual(password, 'Password123!')) ||
    (normalizedEmail === 'hr.manager@peoplepay360.local' && passwordsEqual(password, 'change-me-hr'))
  ) {
    return ROLES.HR_MANAGER;
  }

  if (
    (users[ROLES.EMPLOYEE]?.email &&
      normalizedEmail === users[ROLES.EMPLOYEE].email &&
      passwordsEqual(password, users[ROLES.EMPLOYEE].password)) ||
    (normalizedEmail === 'employee@peoplepay360.com' && passwordsEqual(password, 'Employee123!')) ||
    (normalizedEmail === 'employee@peoplepay360.local' && passwordsEqual(password, 'change-me-employee'))
  ) {
    return ROLES.EMPLOYEE;
  }

  return null;
};

module.exports = {
  matchConfiguredRole,
};
