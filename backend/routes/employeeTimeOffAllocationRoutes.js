const express = require('express');
const {
  getEmployeeAllocations,
  createEmployeeAllocation,
} = require('../controllers/timeOffAllocationController');

const router = express.Router({ mergeParams: true });

router.get('/', getEmployeeAllocations);
router.post('/', createEmployeeAllocation);

module.exports = router;
