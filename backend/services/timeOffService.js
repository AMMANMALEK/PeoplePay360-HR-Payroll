const mongoose = require('mongoose');
const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const findTimeOffTypeByIdentifier = async (identifier) => {
  if (!identifier) {
    return null;
  }

  if (isValidObjectId(identifier)) {
    return TimeOffType.findById(identifier);
  }

  const type = await TimeOffType.findOne({
    typeCode: String(identifier).trim().toUpperCase(),
  });

  if (type) {
    return type;
  }

  return TimeOffType.findOne({
    name: { $regex: new RegExp(`^${String(identifier).trim()}$`, 'i') },
  });
};

const calculateDuration = (startDate, endDate, unit = 'days', hoursPerDay = 8) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const diffMs = end - start;

  if (diffMs < 0) {
    const error = new Error('INVALID_DATE_RANGE');
    throw error;
  }

  if (unit === 'hours') {
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return days * hoursPerDay;
  }

  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const findActiveAllocation = async (employeeId, timeOffTypeId, requestStartDate) => {
  const date = normalizeDate(requestStartDate);

  return TimeOffAllocation.findOne({
    employee: employeeId,
    timeOffType: timeOffTypeId,
    status: 'approved',
    validFrom: { $lte: date },
    validTo: { $gte: date },
  }).sort({ validFrom: -1 });
};

const approveAllocationRecord = async (allocation) => {
  if (allocation.status === 'approved') {
    const error = new Error('ALLOCATION_ALREADY_APPROVED');
    throw error;
  }

  allocation.status = 'approved';
  allocation.remaining = Math.max(allocation.allocated - allocation.taken, 0);
  await allocation.save();
  return allocation;
};

const approveTimeOffRequest = async (request, reviewerId, reviewNotes = '') => {
  if (request.status !== 'pending') {
    const error = new Error('REQUEST_NOT_PENDING');
    throw error;
  }

  const timeOffType = await TimeOffType.findById(request.timeOffType);

  if (!timeOffType) {
    const error = new Error('TYPE_NOT_FOUND');
    throw error;
  }

  if (timeOffType.requiresAllocation) {
    const allocation = await findActiveAllocation(
      request.employee,
      request.timeOffType,
      request.startDate
    );

    if (!allocation) {
      const error = new Error('ALLOCATION_NOT_FOUND');
      throw error;
    }

    if (allocation.remaining < request.duration) {
      const error = new Error('INSUFFICIENT_BALANCE');
      error.remaining = allocation.remaining;
      error.requested = request.duration;
      throw error;
    }

    allocation.taken += request.duration;
    allocation.remaining = Math.max(allocation.allocated - allocation.taken, 0);
    await allocation.save();
    request.allocation = allocation._id;
  }

  request.status = 'approved';
  request.reviewedBy = reviewerId || null;
  request.reviewNotes = reviewNotes;
  request.reviewedAt = new Date();
  await request.save();

  return request;
};

const refuseTimeOffRequest = async (request, reviewerId, reviewNotes = '') => {
  if (request.status !== 'pending') {
    const error = new Error('REQUEST_NOT_PENDING');
    throw error;
  }

  request.status = 'refused';
  request.reviewedBy = reviewerId || null;
  request.reviewNotes = reviewNotes;
  request.reviewedAt = new Date();
  await request.save();

  return request;
};

const syncExpiredAllocations = async (employeeId = null) => {
  const today = normalizeDate(new Date());
  const filter = {
    status: 'approved',
    validTo: { $lt: today },
  };

  if (employeeId) {
    filter.employee = employeeId;
  }

  await TimeOffAllocation.updateMany(filter, { status: 'expired' });
};

module.exports = {
  normalizeDate,
  findTimeOffTypeByIdentifier,
  calculateDuration,
  findActiveAllocation,
  approveAllocationRecord,
  approveTimeOffRequest,
  refuseTimeOffRequest,
  syncExpiredAllocations,
};
