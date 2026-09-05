const express = require('express');
const {
  createEmployeeAttendance,
  getEmployeeAttendance,
} = require('../controllers/attendanceController');

const router = express.Router({ mergeParams: true });

router.post('/', createEmployeeAttendance);
router.get('/', getEmployeeAttendance);

module.exports = router;
