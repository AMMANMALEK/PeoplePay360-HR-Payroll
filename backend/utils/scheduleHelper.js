const mongoose = require('mongoose');
const WorkingSchedule = require('../models/WorkingSchedule');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const findScheduleByIdentifier = async (identifier) => {
  if (!identifier) {
    return null;
  }

  if (isValidObjectId(identifier) && String(identifier).length === 24) {
    return WorkingSchedule.findById(identifier);
  }

  const schedule = await WorkingSchedule.findOne({
    scheduleCode: String(identifier).trim().toUpperCase(),
  });

  if (schedule) {
    return schedule;
  }

  return WorkingSchedule.findOne({
    name: { $regex: new RegExp(`^${String(identifier).trim()}$`, 'i') },
  });
};

module.exports = {
  findScheduleByIdentifier,
};
