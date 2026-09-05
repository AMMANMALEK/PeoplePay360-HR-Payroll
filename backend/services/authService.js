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
    users[ROLES.HR_MANAGER].email &&
    users[ROLES.HR_MANAGER].password &&
    normalizedEmail === users[ROLES.HR_MANAGER].email &&
    passwordsEqual(password, users[ROLES.HR_MANAGER].password)
  ) {
    return ROLES.HR_MANAGER;
  }

  if (
    users[ROLES.EMPLOYEE].email &&
    users[ROLES.EMPLOYEE].password &&
    normalizedEmail === users[ROLES.EMPLOYEE].email &&
    passwordsEqual(password, users[ROLES.EMPLOYEE].password)
  ) {
    return ROLES.EMPLOYEE;
  }

  return null;
};

module.exports = {
  matchConfiguredRole,
};
