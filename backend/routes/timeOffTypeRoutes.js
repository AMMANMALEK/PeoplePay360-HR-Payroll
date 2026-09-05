const express = require('express');
const {
  getAllTimeOffTypes,
  getTimeOffTypeById,
  createTimeOffType,
  updateTimeOffType,
  deleteTimeOffType,
} = require('../controllers/timeOffTypeController');

const router = express.Router();

router.get('/', getAllTimeOffTypes);
router.post('/', createTimeOffType);
router.get('/:id', getTimeOffTypeById);
router.put('/:id', updateTimeOffType);
router.delete('/:id', deleteTimeOffType);

module.exports = router;
