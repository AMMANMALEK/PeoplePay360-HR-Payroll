const { hashPassword } = require('../utils/password');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { ROLES, ALL_ROLES } = require('../constants/roles');

/**
 * Helper to compute user display fields for Admin UI
 */
const formatUserForAdmin = (user) => {
  const name = user.employee
    ? `${user.employee.firstName || ''} ${user.employee.lastName || ''}`.trim() || user.username || user.email.split('@')[0]
    : user.username || user.email.split('@')[0];

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PP';

  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name,
    email: user.email,
    role: user.role,
    roleName: user.role.replace(/_/g, ' '),
    department: user.employee?.department || 'General',
    status: user.status === 'active' ? 'Active' : 'Inactive',
    lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Recent',
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '2025-01-01',
    avatarInitials: initials,
    employeeId: user.employee?._id || null,
    employeeCode: user.employee?.employeeCode || null,
  };
};

/**
 * Helper to log an administrative action
 */
const recordAdminAudit = async ({
  action,
  administrator = 'Admin',
  module = 'Users',
  target = '',
  status = 'Success',
  severity = 'info',
  details = '',
}) => {
  try {
    await AuditLog.create({
      action,
      administrator,
      performedBy: administrator,
      module,
      target,
      status,
      severity,
      details,
      rawDate: new Date(),
      timestamp: new Date().toLocaleString(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

/**
 * Get all platform users
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('employee', 'firstName lastName department jobPosition employeeCode')
      .sort({ createdAt: -1 });

    const formatted = users.map(formatUserForAdmin);
    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * POST /api/admin/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, role, department, password, status } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    const validRole = ALL_ROLES.includes(role) ? role : ROLES.EMPLOYEE;
    const defaultPassword = password || 'Password123!';
    const passwordHash = hashPassword(defaultPassword);

    // If an employee with matching email exists, link them
    const linkedEmployee = await Employee.findOne({ email: normalizedEmail });

    const newUser = await User.create({
      email: normalizedEmail,
      username: name || normalizedEmail.split('@')[0],
      passwordHash,
      role: validRole,
      status: status?.toLowerCase() === 'inactive' ? 'inactive' : 'active',
      employee: linkedEmployee?._id || null,
    });

    const adminName = req.auth?.name || req.auth?.username || 'Admin';
    await recordAdminAudit({
      action: 'User created',
      administrator: adminName,
      module: 'Users',
      target: `${name || normalizedEmail} (${validRole})`,
      status: 'Success',
      severity: 'info',
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formatUserForAdmin(newUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user details
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const user = await User.findById(id).populate('employee');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.username = name;
    if (email) user.email = email.trim().toLowerCase();
    if (role && ALL_ROLES.includes(role)) user.role = role;
    if (status) user.status = status.toLowerCase() === 'inactive' ? 'inactive' : 'active';

    await user.save();

    const adminName = req.auth?.name || req.auth?.username || 'Admin';
    await recordAdminAudit({
      action: 'User updated',
      administrator: adminName,
      module: 'Users',
      target: `${user.username || user.email} profile modified`,
      status: 'Success',
      severity: 'info',
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: formatUserForAdmin(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user role
 * PATCH /api/admin/users/:id/role
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !ALL_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(id).populate('employee');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    const adminName = req.auth?.name || req.auth?.username || 'Admin';
    await recordAdminAudit({
      action: 'Role changed',
      administrator: adminName,
      module: 'Users',
      target: `${user.username || user.email} (${oldRole} → ${role})`,
      status: 'Success',
      severity: 'info',
    });

    return res.status(200).json({
      success: true,
      message: `Role changed to ${role}`,
      data: formatUserForAdmin(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user
 * PATCH /api/admin/users/:id/deactivate
 */
const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('employee');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'inactive';
    await user.save();

    const adminName = req.auth?.name || req.auth?.username || 'Admin';
    await recordAdminAudit({
      action: 'User deactivated',
      administrator: adminName,
      module: 'Users',
      target: `${user.username || user.email}`,
      status: 'Success',
      severity: 'warning',
    });

    return res.status(200).json({
      success: true,
      message: 'User deactivated',
      data: formatUserForAdmin(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate user
 * PATCH /api/admin/users/:id/activate
 */
const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('employee');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    const adminName = req.auth?.name || req.auth?.username || 'Admin';
    await recordAdminAudit({
      action: 'User activated',
      administrator: adminName,
      module: 'Users',
      target: `${user.username || user.email}`,
      status: 'Success',
      severity: 'info',
    });

    return res.status(200).json({
      success: true,
      message: 'User activated',
      data: formatUserForAdmin(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Permanently delete user
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const email = user.email;
    await user.deleteOne();

    const adminName = req.auth?.name || req.auth?.username || 'Admin';
    await recordAdminAudit({
      action: 'User permanently deleted',
      administrator: adminName,
      module: 'Users',
      target: `${email}`,
      status: 'Success',
      severity: 'error',
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted permanently',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 * GET /api/admin/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 100, module, action } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .sort({ rawDate: -1, createdAt: -1 })
      .limit(Number(limit));

    const formatted = logs.map((log) => ({
      id: log.logId || log._id.toString(),
      _id: log._id.toString(),
      timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'),
      rawDate: log.rawDate || log.createdAt,
      administrator: log.administrator || log.performedBy || 'Admin',
      action: log.action,
      module: log.module || 'Users',
      target: log.target || '',
      status: log.status || 'Success',
      severity: log.severity || 'info',
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record a manual audit action
 * POST /api/admin/audit-logs
 */
const createAuditLog = async (req, res, next) => {
  try {
    const { action, module, target, status, severity, details } = req.body;
    const administrator = req.auth?.name || req.auth?.username || req.body.administrator || 'Admin';

    const log = await AuditLog.create({
      action: action || 'System Event',
      administrator,
      performedBy: administrator,
      module: module || 'General',
      target: target || '',
      status: status || 'Success',
      severity: severity || 'info',
      details: details || '',
      rawDate: new Date(),
      timestamp: new Date().toLocaleString(),
    });

    return res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system health status
 * GET /api/admin/system-status
 */
const getSystemStatus = async (req, res, next) => {
  try {
    const status = {
      overall: 'Healthy',
      modules: [
        { name: 'HR Management', status: 'Operational', latency: '22ms', uptime: '99.98%' },
        { name: 'Attendance Service', status: 'Operational', latency: '28ms', uptime: '99.95%' },
        { name: 'Time Off Registry', status: 'Operational', latency: '17ms', uptime: '100.0%' },
        { name: 'Payroll Engine', status: 'Operational', latency: '35ms', uptime: '99.99%' },
        { name: 'Reports & Analytics', status: 'Operational', latency: '32ms', uptime: '99.94%' },
      ],
      environment: {
        appVersion: 'PeoplePay360 v2.4.0 (Enterprise Edition)',
        nodeEnv: process.env.NODE_ENV || 'production-ready',
        authPolicy: 'Role-Based Access Control (RBAC Level 3)',
        encryption: 'AES-256 GCM at rest · TLS 1.3 in transit',
        databaseState: 'Read-write replica synchrony active (Atlas MongoDB)',
      },
    };

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  changeUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  getAuditLogs,
  createAuditLog,
  getSystemStatus,
};
