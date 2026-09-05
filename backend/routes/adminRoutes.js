const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const adminController = require('../controllers/adminController');

// All Admin routes require authentication and ADMIN role
router.use(requireAuth);
router.use(requireRole(ROLES.ADMIN));

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/role', adminController.changeUserRole);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.delete('/users/:id', adminController.deleteUser);

// Audit logs routes
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/audit-logs', adminController.createAuditLog);

// System health / diagnostic status
router.get('/system-status', adminController.getSystemStatus);

module.exports = router;
