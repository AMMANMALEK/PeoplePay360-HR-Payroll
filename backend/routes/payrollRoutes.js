const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const payrollController = require('../controllers/payrollController');

// All payroll routes require session authentication
router.use(requireAuth);

const canAccessPayroll = requireRole(ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN);
const canManagePayroll = requireRole(ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN);

// ==========================================
// SALARY STRUCTURES
// ==========================================
router.route('/salary-structures')
  .get(canAccessPayroll, payrollController.getSalaryStructures)
  .post(canManagePayroll, payrollController.createSalaryStructure);

router.route('/salary-structures/:id')
  .put(canManagePayroll, payrollController.updateSalaryStructure);

// ==========================================
// SALARY RULES
// ==========================================
router.route('/salary-rules')
  .get(canAccessPayroll, payrollController.getSalaryRules)
  .post(canManagePayroll, payrollController.createSalaryRule);

router.route('/salary-rules/:id')
  .put(canManagePayroll, payrollController.updateSalaryRule);

// ==========================================
// PAYRUNS
// ==========================================
router.post('/payruns/init', canAccessPayroll, payrollController.initPayrun);
router.post('/payruns/eligible-employees', canAccessPayroll, payrollController.getEligibleEmployees);

router.route('/payruns')
  .get(canAccessPayroll, payrollController.getPayruns)
  .post(canAccessPayroll, payrollController.createPayrun);

router.route('/payruns/:id')
  .get(canAccessPayroll, payrollController.getPayrunById);

router.put('/payruns/:id/compute', canAccessPayroll, payrollController.computePayrun);
router.put('/payruns/:id/validate', canManagePayroll, payrollController.validatePayrun);
router.put('/payruns/:id/mark-paid', canManagePayroll, payrollController.markPayrunPaid);
router.put('/payruns/:id/send-payslips', canManagePayroll, payrollController.sendPayslips);

// ==========================================
// PAYSLIPS
// ==========================================
router.route('/payslips')
  .get(canAccessPayroll, payrollController.getPayslips);

router.route('/payslips/:id')
  .get(canAccessPayroll, payrollController.getPayslipById);

router.get('/payslips/:id/pdf', canAccessPayroll, payrollController.generatePayslipPdf);

module.exports = router;
