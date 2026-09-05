const User = require('../models/User');
const Employee = require('../models/Employee');
const { getConfiguredUsers } = require('../config/authUsers');
const { ROLES, getPermissionsForRole } = require('../constants/roles');
const { matchConfiguredRole } = require('../services/authService');
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

    const configuredRole = matchConfiguredRole(email, password);

    if (configuredRole === ROLES.ADMIN) {
      const user = await upsertUser({ email, role: ROLES.ADMIN, employeeId: null });
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId: null,
        employeeCode: null,
        userId: user._id,
      });
    }

    if (configuredRole === ROLES.HR_MANAGER) {
      const user = await upsertUser({ email, role: ROLES.HR_MANAGER, employeeId: null });
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId: null,
        employeeCode: null,
        userId: user._id,
      });
    }

    const dbUser = await User.findOne({ email, role: ROLES.EMPLOYEE }).select('+passwordHash');
    if (dbUser?.passwordHash) {
      if (!verifyPassword(password, dbUser.passwordHash)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (!dbUser.employee) {
        return res.status(403).json({
          success: false,
          message: 'No employee record is linked to this account',
        });
      }

      const employee = await Employee.findById(dbUser.employee);
      if (!employee) {
        return res.status(403).json({
          success: false,
          message: 'No employee record is linked to this account',
        });
      }

      if (!isEmployeeAccountActive(employee)) {
        return res.status(403).json({
          success: false,
          message: 'This employee account is not active',
        });
      }

      return issueSession(res, {
        email: dbUser.email,
        role: ROLES.EMPLOYEE,
        employeeId: employee._id,
        employeeCode: employee.employeeCode,
        userId: dbUser._id,
      });
    }

    if (configuredRole === ROLES.EMPLOYEE) {
      const { employeeId, employeeCode } = await resolveConfiguredEmployeeLink();
      if (employeeId) {
        const employee = await Employee.findById(employeeId);
        if (employee && !isEmployeeAccountActive(employee)) {
          return res.status(403).json({
            success: false,
            message: 'This employee account is not active',
          });
        }
      }
      const user = await upsertUser({ email, role: ROLES.EMPLOYEE, employeeId });
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId,
        employeeCode,
        userId: user._id,
      });
    }

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
