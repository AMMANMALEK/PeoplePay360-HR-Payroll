const User = require('../models/User');
const Employee = require('../models/Employee');
const { ROLES } = require('../constants/roles');
const { getConfiguredUsers } = require('../config/authUsers');
const { hashPassword } = require('../utils/password');

const ALL_ROLE_SPECS = [
  ROLES.ADMIN,
  ROLES.HR_MANAGER,
  ROLES.HR_PAYROLL_MANAGER,
  ROLES.HR_PAYROLL_USER,
  ROLES.EMPLOYEE,
];

/**
 * Ensure all configured platform user accounts exist in database.
 */
const ensurePayrollRoleUsers = async () => {
  const configured = getConfiguredUsers();

  for (const role of ALL_ROLE_SPECS) {
    const spec = configured[role];
    if (!spec?.email) continue;

    const normalizedEmail = spec.email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      // Ensure passwordHash is present if it was missing
      if (!existing.passwordHash && spec.password) {
        existing.passwordHash = hashPassword(spec.password);
        await existing.save();
      }
      continue;
    }

    const linkedEmployee = await Employee.findOne({ email: normalizedEmail });
    const passwordHash = spec.password ? hashPassword(spec.password) : hashPassword('Password123!');

    await User.create({
      email: normalizedEmail,
      role,
      passwordHash,
      status: 'active',
      employee: linkedEmployee?._id || null,
    });
    console.log(`[RBAC] Seeded ${role} user account: ${normalizedEmail}`);
  }
};

module.exports = {
  ensurePayrollRoleUsers,
};
