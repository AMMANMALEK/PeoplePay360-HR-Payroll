const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');

const router = express.Router();

router.use('/employees/:employeeCode/attendance', attendanceRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;
