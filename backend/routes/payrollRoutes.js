const express = require('express');
const router = express.Router();
const { requireAuth, requirePermission } = require('../middleware/auth');
const payrollController = require('../controllers/payrollController');

router.use(requireAuth);

const canAccessPayroll = requirePermission('canAccessPayroll');
const canComputePayrun = requirePermission('canComputePayrun');
const canValidatePayrun = requirePermission('canValidatePayrun');
const canManageSalaryConfig = requirePermission('canManageSalaryConfig');
const canDeletePayrun = requirePermission('canDeletePayrun');
const canUpdatePayslip = requirePermission('canUpdatePayslip');
const canDeletePayslip = requirePermission('canDeletePayslip');

router.route('/salary-structures')
  .get(canAccessPayroll, payrollController.getSalaryStructures)
  .post(canManageSalaryConfig, payrollController.createSalaryStructure);

router.route('/salary-structures/:id')
  .put(canManageSalaryConfig, payrollController.updateSalaryStructure)
  .delete(canManageSalaryConfig, payrollController.deleteSalaryStructure);

router.route('/salary-rules')
  .get(canAccessPayroll, payrollController.getSalaryRules)
  .post(canManageSalaryConfig, payrollController.createSalaryRule);

router.route('/salary-rules/:id')
  .put(canManageSalaryConfig, payrollController.updateSalaryRule)
  .delete(canManageSalaryConfig, payrollController.deleteSalaryRule);

router.post('/payruns/init', canComputePayrun, payrollController.initPayrun);
router.post('/payruns/eligible-employees', canComputePayrun, payrollController.getEligibleEmployees);

router.route('/payruns')
  .get(canAccessPayroll, payrollController.getPayruns)
  .post(canComputePayrun, payrollController.createPayrun);

router.route('/payruns/:id')
  .get(canAccessPayroll, payrollController.getPayrunById)
  .put(canComputePayrun, payrollController.updatePayrun)
  .delete(canDeletePayrun, payrollController.deletePayrun);

router.put('/payruns/:id/compute', canComputePayrun, payrollController.computePayrun);
router.put('/payruns/:id/validate', canValidatePayrun, payrollController.validatePayrun);
router.put('/payruns/:id/mark-paid', canValidatePayrun, payrollController.markPayrunPaid);
router.put('/payruns/:id/send-payslips', canUpdatePayslip, payrollController.sendPayslips);

router.route('/payslips')
  .get(canAccessPayroll, payrollController.getPayslips);

router.route('/payslips/:id')
  .get(canAccessPayroll, payrollController.getPayslipById)
  .put(canUpdatePayslip, payrollController.updatePayslip)
  .delete(canDeletePayslip, payrollController.deletePayslip);

router.get('/payslips/:id/pdf', canAccessPayroll, payrollController.generatePayslipPdf);

module.exports = router;
