const parseCookies = require('../utils/parseCookies');
const { getSession } = require('../services/sessionStore');
const { getPermissionsForRole } = require('../constants/roles');

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

  if (!allowedRoles.includes(req.auth.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
    });
  }

  return next();
};

const getAuthenticatedEmployeeId = (req) => req.auth?.employeeId || null;

module.exports = {
  SESSION_COOKIE,
  getSessionIdFromRequest,
  requireAuth,
  requireRole,
  getAuthenticatedEmployeeId,
};
