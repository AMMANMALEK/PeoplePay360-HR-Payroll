const mongoose = require('mongoose');
const TimeOffRequest = require('../models/TimeOffRequest');
const Employee = require('../models/Employee');
const { findEmployeeByCode } = require('../utils/employeeHelper');
const {
  findTimeOffTypeByIdentifier,
  calculateDuration,
  approveTimeOffRequest,
  refuseTimeOffRequest,
  syncExpiredAllocations,
} = require('../services/timeOffService');
const {
  yearFromDate,
  ensureEmployeePersonalLeaveAllocation,
  findOverlappingRequest,
} = require('../services/personalLeavePolicy');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const populateRequest = (query) =>
  query
    .populate('employee', 'firstName lastName email employeeCode department jobPosition')
    .populate('timeOffType', 'typeCode name unit requiresAllocation requiresApproval isPaid')
    .populate('allocation', 'allocated taken remaining validFrom validTo status')
    .populate('reviewedBy', 'firstName lastName email employeeCode');

const resolveReviewer = async (reviewerValue) => {
  if (!reviewerValue) {
    return null;
  }

  if (isValidObjectId(reviewerValue)) {
    return Employee.findById(reviewerValue);
  }

  return findEmployeeByCode(reviewerValue);
};

const handleRequestError = (error, res, next) => {
  if (error.message === 'TYPE_NOT_FOUND') {
    return res.status(400).json({
      success: false,
      message: 'Time off type not found',
    });
  }

  if (error.message === 'INVALID_DATE_RANGE') {
    return res.status(400).json({
      success: false,
      message: 'End date must be on or after start date',
    });
  }

  if (error.message === 'REQUEST_NOT_PENDING') {
    return res.status(409).json({
      success: false,
      message: 'Only pending requests can be reviewed',
    });
  }

  if (error.message === 'ALLOCATION_NOT_FOUND') {
    return res.status(400).json({
      success: false,
      message: 'No approved allocation found for this leave type and date range',
    });
  }

  if (error.message === 'INSUFFICIENT_BALANCE') {
    const remaining = Number(error.remaining || 0);
    return res.status(400).json({
      success: false,
      message: `You have only ${remaining} Personal Leave days remaining.`,
      remaining,
      requested: error.requested,
    });
  }

  if (error.message === 'OVERLAPPING_REQUEST') {
    return res.status(409).json({
      success: false,
      message: 'This request overlaps an existing Personal Leave request.',
    });
  }

  if (error.message === 'TYPE_NOT_ALLOWED') {
    return res.status(400).json({
      success: false,
      message: 'Only Personal Leave can be requested.',
    });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  return next(error);
};

const getAllTimeOffRequests = async (req, res, next) => {
  try {
    const { status, employeeCode, timeOffType } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (employeeCode) {
      const employee = await findEmployeeByCode(employeeCode);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found with the given employee code',
        });
      }

      filter.employee = employee._id;
    }

    if (timeOffType) {
      const type = await findTimeOffTypeByIdentifier(timeOffType);

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Time off type not found',
        });
      }

      filter.timeOffType = type._id;
    }

    const requests = await populateRequest(TimeOffRequest.find(filter).sort({ createdAt: -1 }));

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeTimeOffRequests = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    await syncExpiredAllocations(employee._id);
    await ensureEmployeePersonalLeaveAllocation(employee._id);

    const { status } = req.query;
    const filter = { employee: employee._id };

    if (status) {
      filter.status = status;
    }

    const requests = await populateRequest(TimeOffRequest.find(filter).sort({ createdAt: -1 }));

    res.status(200).json({
      success: true,
      count: requests.length,
      employee: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const createEmployeeTimeOffRequest = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const { timeOffType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const executeCreate = async (session) => {
      const { type, allocation } = await ensureEmployeePersonalLeaveAllocation(
        employee._id,
        yearFromDate(startDate),
        session
      );

      if (timeOffType) {
        const requestedType = await findTimeOffTypeByIdentifier(timeOffType);
        if (
          !requestedType ||
          String(requestedType._id) !== String(type._id) ||
          requestedType.isActive === false
        ) {
          const error = new Error('TYPE_NOT_ALLOWED');
          throw error;
        }
      }

      const calculatedDuration = calculateDuration(startDate, endDate, type.unit);

      const overlap = await findOverlappingRequest(employee._id, startDate, endDate, session);
      if (overlap) {
        const error = new Error('OVERLAPPING_REQUEST');
        throw error;
      }

      if (allocation.remaining < calculatedDuration) {
        const error = new Error('INSUFFICIENT_BALANCE');
        error.remaining = allocation.remaining;
        error.requested = calculatedDuration;
        throw error;
      }

      const [created] = await TimeOffRequest.create(
        [
          {
            employee: employee._id,
            timeOffType: type._id,
            startDate,
            endDate,
            duration: calculatedDuration,
            unit: type.unit,
            reason,
            status: 'pending',
          },
        ],
        session ? { session } : undefined
      );

      await approveTimeOffRequest(
        created,
        null,
        'Personal Leave approved automatically.',
        session
      );

      return created._id;
    };

    let requested;
    try {
      requested = await mongoose.connection.transaction(executeCreate);
    } catch (error) {
      const message = String(error.message || '');
      if (message.includes('Transaction numbers are only allowed')) {
        requested = await executeCreate(null);
      } else {
        throw error;
      }
    }

    const populatedRequest = await populateRequest(TimeOffRequest.findById(requested));
    const remaining =
      populatedRequest?.allocation && typeof populatedRequest.allocation === 'object'
        ? populatedRequest.allocation.remaining
        : undefined;

    res.status(201).json({
      success: true,
      message: 'Personal Leave approved successfully.',
      remaining,
      data: populatedRequest,
    });
  } catch (error) {
    return handleRequestError(error, res, next);
  }
};

const getTimeOffRequestById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const request = await populateRequest(TimeOffRequest.findById(req.params.requestId));

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const approveRequest = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const request = await TimeOffRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found',
      });
    }

    const reviewer = await resolveReviewer(req.body.reviewedBy);
    await approveTimeOffRequest(request, reviewer ? reviewer._id : null, req.body.reviewNotes || '');

    const populatedRequest = await populateRequest(TimeOffRequest.findById(request._id));

    res.status(200).json({
      success: true,
      message: 'Time off request approved successfully',
      data: populatedRequest,
    });
  } catch (error) {
    return handleRequestError(error, res, next);
  }
};

const refuseRequest = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const request = await TimeOffRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found',
      });
    }

    const reviewer = await resolveReviewer(req.body.reviewedBy);
    await refuseTimeOffRequest(request, reviewer ? reviewer._id : null, req.body.reviewNotes || '');

    const populatedRequest = await populateRequest(TimeOffRequest.findById(request._id));

    res.status(200).json({
      success: true,
      message: 'Time off request refused successfully',
      data: populatedRequest,
    });
  } catch (error) {
    return handleRequestError(error, res, next);
  }
};

const deleteTimeOffRequest = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      });
    }

    const request = await populateRequest(TimeOffRequest.findById(req.params.requestId));

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found',
      });
    }

    if (request.status === 'approved') {
      return res.status(409).json({
        success: false,
        message: 'Approved requests cannot be deleted',
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Time off request deleted successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTimeOffRequests,
  getEmployeeTimeOffRequests,
  createEmployeeTimeOffRequest,
  getTimeOffRequestById,
  approveRequest,
  refuseRequest,
  deleteTimeOffRequest,
};
