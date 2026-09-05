const express = require('express');
const { getAllAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.get('/', getAllAttendance);

module.exports = router;
