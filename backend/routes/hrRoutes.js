const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const employeeContractRoutes = require('./employeeContractRoutes');
const employeeScheduleRoutes = require('./employeeScheduleRoutes');
const contractRoutes = require('./contractRoutes');
const workingScheduleRoutes = require('./workingScheduleRoutes');
const timeOffRoutes = require('./timeOffRoutes');
const employeeTimeOffAllocationRoutes = require('./employeeTimeOffAllocationRoutes');
const employeeTimeOffRequestRoutes = require('./employeeTimeOffRequestRoutes');

const router = express.Router();

router.use('/working-schedules', workingScheduleRoutes);
router.use('/contracts', contractRoutes);
router.use('/time-off', timeOffRoutes);
router.use('/employees/:employeeCode/attendance', attendanceRoutes);
router.use('/employees/:employeeCode/contracts', employeeContractRoutes);
router.use('/employees/:employeeCode/working-schedule', employeeScheduleRoutes);
router.use('/employees/:employeeCode/time-off/allocations', employeeTimeOffAllocationRoutes);
router.use('/employees/:employeeCode/time-off/requests', employeeTimeOffRequestRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;
