const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const employeeContractRoutes = require('./employeeContractRoutes');
const employeeScheduleRoutes = require('./employeeScheduleRoutes');
const contractRoutes = require('./contractRoutes');
const workingScheduleRoutes = require('./workingScheduleRoutes');

const router = express.Router();

router.use('/working-schedules', workingScheduleRoutes);
router.use('/contracts', contractRoutes);
router.use('/employees/:employeeCode/attendance', attendanceRoutes);
router.use('/employees/:employeeCode/contracts', employeeContractRoutes);
router.use('/employees/:employeeCode/working-schedule', employeeScheduleRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;
