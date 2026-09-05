const express = require('express');
const {
  getAllEmployees,
  getEmployeeByCode,
  createEmployee,
  updateEmployeeByCode,
  deleteEmployeeByCode,
  assignScheduleToEmployee,
} = require('../controllers/employeeController');
const validateEmployeeCode = require('../middleware/validateEmployeeCode');

const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.get('/:employeeCode', validateEmployeeCode, getEmployeeByCode);
router.put('/:employeeCode', validateEmployeeCode, updateEmployeeByCode);
router.delete('/:employeeCode', validateEmployeeCode, deleteEmployeeByCode);
router.put('/:employeeCode/working-schedule', validateEmployeeCode, assignScheduleToEmployee);

module.exports = router;
