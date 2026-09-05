const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const payrollController = require('../controllers/payrollController');

// All payroll routes require authentication
router.use(protect);

// ==========================================
// SALARY STRUCTURES
// ==========================================
router.route('/salary-structures')
  .get(checkRole('HRPayrollUser', 'HRPayrollManager', 'Admin'), payrollController.getSalaryStructures)
  .post(checkRole('HRPayrollManager', 'Admin'), payrollController.createSalaryStructure);

router.route('/salary-structures/:id')
  .put(checkRole('HRPayrollManager', 'Admin'), payrollController.updateSalaryStructure);

// ==========================================
// SALARY RULES
// ==========================================
router.route('/salary-rules')
  .get(checkRole('HRPayrollUser', 'HRPayrollManager', 'Admin'), payrollController.getSalaryRules)
  .post(checkRole('HRPayrollManager', 'Admin'), payrollController.createSalaryRule);

router.route('/salary-rules/:id')
  .put(checkRole('HRPayrollManager', 'Admin'), payrollController.updateSalaryRule);

// ==========================================
// PAYRUNS
// ==========================================
const payrunRoles = checkRole('HRPayrollUser', 'HRPayrollManager', 'Admin');

router.post('/payruns/init', payrunRoles, payrollController.initPayrun);
router.post('/payruns/eligible-employees', payrunRoles, payrollController.getEligibleEmployees);

router.route('/payruns')
  .get(payrunRoles, payrollController.getPayruns)
  .post(payrunRoles, payrollController.createPayrun);

router.route('/payruns/:id')
  .get(payrunRoles, payrollController.getPayrunById);

router.put('/payruns/:id/compute', payrunRoles, payrollController.computePayrun);
router.put('/payruns/:id/validate', payrunRoles, payrollController.validatePayrun);
router.put('/payruns/:id/mark-paid', payrunRoles, payrollController.markPayrunPaid);
router.put('/payruns/:id/send-payslips', payrunRoles, payrollController.sendPayslips);

// ==========================================
// PAYSLIPS
// ==========================================
router.route('/payslips')
  .get(payrunRoles, payrollController.getPayslips);

router.route('/payslips/:id')
  .get(payrunRoles, payrollController.getPayslipById);

router.get('/payslips/:id/pdf', payrunRoles, payrollController.generatePayslipPdf);

module.exports = router;
