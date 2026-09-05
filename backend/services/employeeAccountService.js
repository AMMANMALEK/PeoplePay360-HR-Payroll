const User = require('../models/User');
const Employee = require('../models/Employee');
const { ROLES } = require('../constants/roles');
const { getConfiguredUsers } = require('../config/authUsers');
const { hashPassword } = require('../utils/password');

const getDefaultEmployeePassword = () =>
  String(process.env.EMPLOYEE_DEFAULT_PASSWORD || process.env.EMPLOYEE_PASSWORD || 'Employee123!');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const assertEmailAvailable = async (email, { session, excludeEmployeeId, excludeUserId } = {}) => {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    const error = new Error('EMAIL_REQUIRED');
    throw error;
  }

  const hrEmail = getConfiguredUsers()[ROLES.HR_MANAGER].email;
  if (hrEmail && normalized === hrEmail) {
    const error = new Error('EMAIL_RESERVED');
    throw error;
  }

  const employeeFilter = { email: normalized };
  if (excludeEmployeeId) {
    employeeFilter._id = { $ne: excludeEmployeeId };
  }

  const userFilter = { email: normalized };
  if (excludeUserId) {
    userFilter._id = { $ne: excludeUserId };
  }

  const employeeQuery = Employee.findOne(employeeFilter).select('_id');
  const userQuery = User.findOne(userFilter).select('_id');
  if (session) {
    employeeQuery.session(session);
    userQuery.session(session);
  }

  const [existingEmployee, existingUser] = await Promise.all([employeeQuery, userQuery]);
  if (existingEmployee || existingUser) {
    const error = new Error('EMAIL_IN_USE');
    throw error;
  }

  return normalized;
};

const provisionEmployeeAccount = async (employee, session) => {
  const email = normalizeEmail(employee.email);
  const passwordHash = hashPassword(getDefaultEmployeePassword());
  const payload = {
    email,
    passwordHash,
    role: ROLES.EMPLOYEE,
    employee: employee._id,
  };

  const options = session ? { session } : undefined;
  const created = await User.create([payload], options);
  return created[0];
};

const syncEmployeeAccountEmail = async (employee, session) => {
  const email = normalizeEmail(employee.email);
  const userQuery = User.findOne({ employee: employee._id });
  if (session) {
    userQuery.session(session);
  }
  const user = await userQuery;

  if (!user) {
    await provisionEmployeeAccount(employee, session);
    return;
  }

  if (user.email !== email) {
    user.email = email;
    await user.save(session ? { session } : undefined);
  }
};

const deleteEmployeeAccount = async (employee, session) => {
  const filter = {
    $or: [{ employee: employee._id }, { email: normalizeEmail(employee.email) }],
  };
  const query = User.deleteMany(filter);
  if (session) {
    query.session(session);
  }
  await query;
};

const isEmployeeAccountActive = (employee) => {
  const status = String(employee?.status || 'active').toLowerCase();
  return status !== 'inactive' && status !== 'terminated';
};

module.exports = {
  getDefaultEmployeePassword,
  normalizeEmail,
  assertEmailAvailable,
  provisionEmployeeAccount,
  syncEmployeeAccountEmail,
  deleteEmployeeAccount,
  isEmployeeAccountActive,
};
