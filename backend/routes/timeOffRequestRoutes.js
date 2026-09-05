const express = require('express');
const {
  getAllTimeOffRequests,
  getTimeOffRequestById,
  deleteTimeOffRequest,
} = require('../controllers/timeOffRequestController');

const router = express.Router();

router.get('/', getAllTimeOffRequests);
router.get('/:requestId', getTimeOffRequestById);
router.delete('/:requestId', deleteTimeOffRequest);

module.exports = router;
