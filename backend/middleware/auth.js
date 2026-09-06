const parseCookies = require('../utils/parseCookies');
const { getSession } = require('../services/sessionStore');
const { getPermissionsForRole, ROLES } = require('../constants/roles');

const SESSION_COOKIE = 'peoplepay.sid';

const getSessionIdFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE] || null;
};

const requireAuth = (req, res, next) => {
  const sessionId = getSessionIdFromRequest(req);
  const session = getSession(sessionId);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  req.sessionId = sessionId;
  req.auth = {
    email: session.email,
    role: session.role,
    userId: session.userId,
    employeeId: session.employeeId,
    employeeCode: session.employeeCode,
    permissions: getPermissionsForRole(session.role),
  };

  return next();
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Admin has full functionality across HR Manager, Payroll Manager, Payroll User, and Employee
  if (req.auth.role === ROLES.ADMIN || allowedRoles.includes(req.auth.role)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to access this resource',
  });
};

const requirePermission = (permissionKey) => (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.auth.role === ROLES.ADMIN || req.auth.permissions?.[permissionKey]) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to perform this action',
  });
};

const getAuthenticatedEmployeeId = (req) => req.auth?.employeeId || null;

module.exports = {
  SESSION_COOKIE,
  getSessionIdFromRequest,
  requireAuth,
  requireRole,
  requirePermission,
  getAuthenticatedEmployeeId,
};
