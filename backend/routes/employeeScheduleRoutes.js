const express = require('express');
const { assignScheduleToEmployee } = require('../controllers/contractController');

const router = express.Router({ mergeParams: true });

router.put('/', assignScheduleToEmployee);

module.exports = router;
