const mongoose = require('mongoose');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const { findEmployeeByCode } = require('../utils/employeeHelper');
const {
  findTimeOffTypeByIdentifier,
  normalizeDate,
  approveAllocationRecord,
  syncExpiredAllocations,
} = require('../services/timeOffService');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const populateAllocation = (query) =>
  query.populate('employee', 'firstName lastName email employeeCode department').populate(
    'timeOffType',
    'typeCode name unit requiresAllocation requiresApproval isPaid'
  );

const handleAllocationError = (error, res, next) => {
  if (error.message === 'TYPE_NOT_FOUND') {
    return res.status(400).json({
      success: false,
      message: 'Time off type not found',
    });
  }

  if (error.message === 'ALLOCATION_ALREADY_APPROVED') {
    return res.status(409).json({
      success: false,
      message: 'Allocation is already approved',
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate allocation record',
    });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  if (error.message === 'Valid to date must be on or after valid from date') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
};

const getEmployeeAllocations = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    await syncExpiredAllocations(employee._id);

    const { status } = req.query;
    const filter = { employee: employee._id };

    if (status) {
      filter.status = status;
    }

    const allocations = await populateAllocation(
      TimeOffAllocation.find(filter).sort({ validFrom: -1 })
    );

    res.status(200).json({
      success: true,
      count: allocations.length,
      employee: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
      data: allocations,
    });
  } catch (error) {
    next(error);
  }
};

const createEmployeeAllocation = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const { timeOffType, allocated, validFrom, validTo, status, notes } = req.body;

    if (!timeOffType || allocated === undefined || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'timeOffType, allocated, validFrom, and validTo are required',
      });
    }

    const type = await findTimeOffTypeByIdentifier(timeOffType);

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Time off type not found',
      });
    }

    const allocation = await TimeOffAllocation.create({
      employee: employee._id,
      timeOffType: type._id,
      allocated,
      validFrom: normalizeDate(validFrom),
      validTo: normalizeDate(validTo),
      status: status || 'pending',
      notes,
    });

    const populatedAllocation = await populateAllocation(TimeOffAllocation.findById(allocation._id));

    res.status(201).json({
      success: true,
      message: 'Time off allocation created successfully',
      data: populatedAllocation,
    });
  } catch (error) {
    return handleAllocationError(error, res, next);
  }
};

const getAllocationById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.allocationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid allocation ID',
      });
    }

    const allocation = await populateAllocation(TimeOffAllocation.findById(req.params.allocationId));

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Time off allocation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
};

const updateAllocation = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.allocationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid allocation ID',
      });
    }

    const allocation = await TimeOffAllocation.findById(req.params.allocationId);

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Time off allocation not found',
      });
    }

    if (req.body.timeOffType) {
      const type = await findTimeOffTypeByIdentifier(req.body.timeOffType);

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Time off type not found',
        });
      }

      allocation.timeOffType = type._id;
    }

    if (req.body.allocated !== undefined) {
      allocation.allocated = req.body.allocated;
    }

    if (req.body.validFrom) {
      allocation.validFrom = normalizeDate(req.body.validFrom);
    }

    if (req.body.validTo) {
      allocation.validTo = normalizeDate(req.body.validTo);
    }

    if (req.body.status) {
      allocation.status = req.body.status;
    }

    if (req.body.notes !== undefined) {
      allocation.notes = req.body.notes;
    }

    allocation.remaining = Math.max(allocation.allocated - allocation.taken, 0);
    await allocation.save();

    const populatedAllocation = await populateAllocation(TimeOffAllocation.findById(allocation._id));

    res.status(200).json({
      success: true,
      message: 'Time off allocation updated successfully',
      data: populatedAllocation,
    });
  } catch (error) {
    return handleAllocationError(error, res, next);
  }
};

const deleteAllocation = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.allocationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid allocation ID',
      });
    }

    const allocation = await populateAllocation(TimeOffAllocation.findById(req.params.allocationId));

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Time off allocation not found',
      });
    }

    await allocation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Time off allocation deleted successfully',
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
};

const approveAllocation = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.allocationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid allocation ID',
      });
    }

    const allocation = await TimeOffAllocation.findById(req.params.allocationId);

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Time off allocation not found',
      });
    }

    await approveAllocationRecord(allocation);

    const populatedAllocation = await populateAllocation(TimeOffAllocation.findById(allocation._id));

    res.status(200).json({
      success: true,
      message: 'Time off allocation approved successfully',
      data: populatedAllocation,
    });
  } catch (error) {
    return handleAllocationError(error, res, next);
  }
};

module.exports = {
  getEmployeeAllocations,
  createEmployeeAllocation,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
  approveAllocation,
};
