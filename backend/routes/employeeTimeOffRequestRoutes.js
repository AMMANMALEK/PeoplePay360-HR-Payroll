const express = require('express');
const {
  getEmployeeTimeOffRequests,
  createEmployeeTimeOffRequest,
  approveRequest,
  refuseRequest,
} = require('../controllers/timeOffRequestController');

const router = express.Router({ mergeParams: true });

router.get('/', getEmployeeTimeOffRequests);
router.post('/', createEmployeeTimeOffRequest);
router.put('/:requestId/approve', approveRequest);
router.put('/:requestId/refuse', refuseRequest);

module.exports = router;
