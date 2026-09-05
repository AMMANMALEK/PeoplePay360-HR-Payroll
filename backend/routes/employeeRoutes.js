const express = require('express');
const {
  getAllEmployees,
  getEmployeeByCode,
  createEmployee,
  updateEmployeeByCode,
  deleteEmployeeByCode,
  assignScheduleToEmployee,
} = require('../controllers/employeeController');

const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.get('/:employeeCode', getEmployeeByCode);
router.put('/:employeeCode', updateEmployeeByCode);
router.delete('/:employeeCode', deleteEmployeeByCode);
router.put('/:employeeCode/working-schedule', assignScheduleToEmployee);

module.exports = router;
