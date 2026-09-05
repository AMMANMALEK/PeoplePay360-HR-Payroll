const express = require('express');
const {
  getAllWorkingSchedules,
  getWorkingScheduleById,
  createWorkingSchedule,
  updateWorkingSchedule,
  deleteWorkingSchedule,
} = require('../controllers/workingScheduleController');

const router = express.Router();

router.get('/', getAllWorkingSchedules);
router.post('/', createWorkingSchedule);
router.get('/:id', getWorkingScheduleById);
router.put('/:id', updateWorkingSchedule);
router.delete('/:id', deleteWorkingSchedule);

module.exports = router;
