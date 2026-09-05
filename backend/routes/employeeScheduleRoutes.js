const express = require('express');
const { assignScheduleToEmployee } = require('../controllers/workingScheduleController');

const router = express.Router({ mergeParams: true });

router.put('/', assignScheduleToEmployee);

module.exports = router;
