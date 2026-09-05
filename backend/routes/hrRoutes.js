const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const employeeContractRoutes = require('./employeeContractRoutes');
const contractRoutes = require('./contractRoutes');
const workingScheduleRoutes = require('./workingScheduleRoutes');
const timeOffRoutes = require('./timeOffRoutes');
const employeeTimeOffAllocationRoutes = require('./employeeTimeOffAllocationRoutes');
const employeeTimeOffRequestRoutes = require('./employeeTimeOffRequestRoutes');
const attendanceListRoutes = require('./attendanceListRoutes');
const validateEmployeeCode = require('../middleware/validateEmployeeCode');

const router = express.Router();

router.use('/working-schedules', workingScheduleRoutes);
router.use('/attendance', attendanceListRoutes);
router.use('/contracts', contractRoutes);
router.use('/time-off', timeOffRoutes);
router.use('/employees/:employeeCode/attendance', validateEmployeeCode, attendanceRoutes);
router.use('/employees/:employeeCode/contracts', validateEmployeeCode, employeeContractRoutes);
router.use(
  '/employees/:employeeCode/time-off/allocations',
  validateEmployeeCode,
  employeeTimeOffAllocationRoutes
);
router.use(
  '/employees/:employeeCode/time-off/requests',
  validateEmployeeCode,
  employeeTimeOffRequestRoutes
);
router.use('/employees', employeeRoutes);

module.exports = router;
