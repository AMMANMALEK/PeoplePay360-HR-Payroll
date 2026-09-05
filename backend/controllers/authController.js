const User = require('../models/User');
const Employee = require('../models/Employee');
const { getConfiguredUsers } = require('../config/authUsers');
const { ROLES, getPermissionsForRole } = require('../constants/roles');
const { matchConfiguredRole, isStandardPassword } = require('../services/authService');
const { createSession, destroySession } = require('../services/sessionStore');
const { verifyPassword } = require('../utils/password');
const { isEmployeeAccountActive } = require('../services/employeeAccountService');
const {
  SESSION_COOKIE,
  getSessionIdFromRequest,
} = require('../middleware/auth');
const { SESSION_TTL_MS } = require('../services/sessionStore');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_MS,
};

const toPublicUser = (auth) => ({
  email: auth.email,
  role: auth.role,
  employeeId: auth.employeeId,
  employeeCode: auth.employeeCode,
  permissions: auth.permissions,
});

const resolveConfiguredEmployeeLink = async () => {
  const configured = getConfiguredUsers()[ROLES.EMPLOYEE];
  let employee = null;

  if (configured.employeeCode) {
    employee = await Employee.findOne({ employeeCode: configured.employeeCode });
  }

  if (!employee && configured.email) {
    employee = await Employee.findOne({ email: configured.email });
  }

  if (!employee) {
    employee = await Employee.findOne({ employeeCode: { $ne: 'HRMGR' } });
  }

  return {
    employeeId: employee ? employee._id : null,
    employeeCode: employee ? employee.employeeCode : configured.employeeCode || null,
  };
};

const upsertUser = async ({ email, role, employeeId }) => {
  return User.findOneAndUpdate(
    { email },
    { email, role, employee: employeeId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const issueSession = async (res, { email, role, employeeId, employeeCode, userId }) => {
  const sessionId = createSession({
    userId: userId.toString(),
    email,
    role,
    employeeId: employeeId ? employeeId.toString() : null,
    employeeCode: employeeCode || null,
  });

  res.cookie(SESSION_COOKIE, sessionId, cookieOptions);

  return res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    data: toPublicUser({
      email,
      role,
      employeeId: employeeId ? employeeId.toString() : null,
      employeeCode: employeeCode || null,
      permissions: getPermissionsForRole(role),
    }),
  });
};

const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 1. Check if configured role matches (ADMIN, HR_MANAGER, HR_PAYROLL_MANAGER, etc.)
    const configuredRole = matchConfiguredRole(email, password);
    if (configuredRole) {
      const employee = await Employee.findOne({ email });
      const user = await upsertUser({
        email,
        role: configuredRole,
        employeeId: employee ? employee._id : null,
      });

      console.log(`[AUTH] Configured role sign-in: ${email} (${configuredRole})`);
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId: employee ? employee._id : null,
        employeeCode: employee ? employee.employeeCode : null,
        userId: user._id,
      });
    }

    // 2. Check if user already exists in MongoDB database
    const dbUser = await User.findOne({ email }).select('+passwordHash');
    if (dbUser) {
      let isMatch = false;
      if (dbUser.passwordHash) {
        isMatch = verifyPassword(password, dbUser.passwordHash);
      }
      if (!isMatch && isStandardPassword(password)) {
        isMatch = true;
      }

      if (isMatch) {
        let employee = null;
        if (dbUser.employee) {
          employee = await Employee.findById(dbUser.employee);
        } else {
          employee = await Employee.findOne({ email });
        }

        console.log(`[AUTH] Database user sign-in: ${email} (${dbUser.role})`);
        return issueSession(res, {
          email: dbUser.email,
          role: dbUser.role,
          employeeId: employee ? employee._id : null,
          employeeCode: employee ? employee.employeeCode : null,
          userId: dbUser._id,
        });
      }
    }

    // 3. Check if Employee exists in DB and logging in with standard password
    const employee = await Employee.findOne({ email });
    if (employee && isStandardPassword(password)) {
      const userRole =
        employee.department === 'Human Resources' ||
        employee.jobPosition?.toLowerCase().includes('hr')
          ? ROLES.HR_MANAGER
          : ROLES.EMPLOYEE;

      const user = await upsertUser({
        email,
        role: userRole,
        employeeId: employee._id,
      });

      console.log(`[AUTH] Employee fallback sign-in: ${email} (${userRole})`);
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId: employee._id,
        employeeCode: employee.employeeCode,
        userId: user._id,
      });
    }

    console.warn(`[AUTH] Invalid credentials for: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res) => {
  const sessionId = getSessionIdFromRequest(req);
  destroySession(sessionId);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully',
  });
};

const me = (req, res) => {
  return res.status(200).json({
    success: true,
    data: toPublicUser(req.auth),
  });
};

module.exports = {
  login,
  logout,
  me,
};
