const express = require('express');
const {
  getAllEmployees,
  getEmployeeByCode,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const validateEmployeeCode = require('../middleware/validateEmployeeCode');

const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.get('/:employeeCode', validateEmployeeCode, getEmployeeByCode);
router.put('/:employeeCode', validateEmployeeCode, updateEmployee);
router.delete('/:employeeCode', validateEmployeeCode, deleteEmployee);

module.exports = router;
