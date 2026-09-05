const WorkingSchedule = require('../models/WorkingSchedule');
const { calculateWeeklyHours } = require('../services/workingScheduleService');
const { findScheduleByIdentifier } = require('../utils/scheduleHelper');

const applyWeeklyHours = (payload) => {
  if (payload.weeklyPattern) {
    payload.weeklyHours = calculateWeeklyHours(payload.weeklyPattern);
  }

  return payload;
};

const getAllWorkingSchedules = async (req, res) => {
  try {
    const { scheduleType, isActive, search } = req.query;
    const filter = {};

    if (scheduleType) {
      filter.scheduleType = scheduleType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scheduleCode: { $regex: search, $options: 'i' } },
      ];
    }

    const schedules = await WorkingSchedule.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkingScheduleById = async (req, res) => {
  try {
    const schedule = await findScheduleByIdentifier(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Working schedule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createWorkingSchedule = async (req, res) => {
  try {
    const payload = applyWeeklyHours({ ...req.body });
    const schedule = await WorkingSchedule.create(payload);

    res.status(201).json({
      success: true,
      message: 'Working schedule created successfully',
      data: schedule,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateWorkingSchedule = async (req, res) => {
  try {
    const schedule = await findScheduleByIdentifier(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Working schedule not found',
      });
    }

    const payload = applyWeeklyHours({ ...req.body });
    Object.assign(schedule, payload);
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Working schedule updated successfully',
      data: schedule,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteWorkingSchedule = async (req, res) => {
  try {
    const schedule = await findScheduleByIdentifier(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Working schedule not found',
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Working schedule deleted successfully',
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllWorkingSchedules,
  getWorkingScheduleById,
  createWorkingSchedule,
  updateWorkingSchedule,
  deleteWorkingSchedule,
};
