const express = require('express');
const {
  createEmployeeAttendance,
  getEmployeeAttendance,
  updateEmployeeAttendance,
} = require('../controllers/attendanceController');

const router = express.Router({ mergeParams: true });

router.post('/', createEmployeeAttendance);
router.get('/', getEmployeeAttendance);
router.put('/:attendanceId', updateEmployeeAttendance);

module.exports = router;
