const express = require('express');
const timeOffTypeRoutes = require('./timeOffTypeRoutes');
const timeOffAllocationRoutes = require('./timeOffAllocationRoutes');
const timeOffRequestRoutes = require('./timeOffRequestRoutes');
const { approveRequest, refuseRequest } = require('../controllers/timeOffRequestController');
const { approveAllocation } = require('../controllers/timeOffAllocationController');

const router = express.Router();

router.use('/types', timeOffTypeRoutes);

router.put('/allocations/:allocationId/approve', approveAllocation);
router.use('/allocations', timeOffAllocationRoutes);

router.put('/requests/:requestId/approve', approveRequest);
router.put('/requests/:requestId/refuse', refuseRequest);
router.use('/requests', timeOffRequestRoutes);

module.exports = router;
