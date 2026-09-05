const express = require('express');
const {
  getAllocationById,
  updateAllocation,
  deleteAllocation,
} = require('../controllers/timeOffAllocationController');

const router = express.Router();

router.get('/:allocationId', getAllocationById);
router.put('/:allocationId', updateAllocation);
router.delete('/:allocationId', deleteAllocation);

module.exports = router;
