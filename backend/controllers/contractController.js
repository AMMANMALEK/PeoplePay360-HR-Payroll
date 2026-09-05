const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const { findEmployeeByCode } = require('../utils/employeeHelper');
const { findScheduleByIdentifier } = require('../utils/scheduleHelper');
const {
  validateNoOverlap,
  resolveContractStatus,
  getActiveContract,
  getContractForPeriod,
  syncExpiredContracts,
  normalizeDate,
} = require('../services/contractService');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const populateContract = (query) =>
  query
    .populate('employee', 'firstName lastName email employeeCode department jobPosition')
    .populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours weeklyPattern');

const resolveWorkingSchedule = async (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const schedule = await findScheduleByIdentifier(value);

  if (!schedule) {
    const error = new Error('SCHEDULE_NOT_FOUND');
    throw error;
  }

  return schedule._id;
};

const prepareContractPayload = async (body, employeeId, existingContract = null) => {
  const payload = { ...body, employee: employeeId };

  if ('workingSchedule' in payload) {
    payload.workingSchedule = await resolveWorkingSchedule(payload.workingSchedule);
  }

  if (payload.startDate) {
    payload.startDate = normalizeDate(payload.startDate);
  }

  if (payload.endDate) {
    payload.endDate = normalizeDate(payload.endDate);
  }

  const statusInput = {
    ...(existingContract ? existingContract.toObject() : {}),
    ...payload,
  };

  if (!statusInput.startDate && existingContract) {
    statusInput.startDate = existingContract.startDate;
  }

  if (statusInput.endDate === undefined && existingContract) {
    statusInput.endDate = existingContract.endDate;
  }

  if (body.status) {
    statusInput.status = body.status;
  }

  payload.status = resolveContractStatus(statusInput);

  return payload;
};

const handleContractError = (error, res) => {
  if (error.message === 'SCHEDULE_NOT_FOUND') {
    return res.status(400).json({
      success: false,
      message:
        'Working schedule not found. Create it first at POST /api/hr/working-schedules or omit workingSchedule from the request body.',
    });
  }

  if (error.message === 'CONTRACT_OVERLAP') {
    return res.status(409).json({
      success: false,
      message: 'Contract dates overlap with an existing active or draft contract',
      overlappingContracts: error.overlappingContracts,
    });
  }

  if (error.message === 'INVALID_PERIOD') {
    return res.status(400).json({
      success: false,
      message: 'Period start date must be before or equal to end date',
    });
  }

  if (error.message === 'AMBIGUOUS_CONTRACT') {
    return res.status(409).json({
      success: false,
      message: 'Multiple contracts match this payroll period. Resolve overlapping contracts first',
      matchingContracts: error.matchingContracts,
    });
  }

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

  if (error.message === 'Contract end date must be on or after start date') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message,
  });
};

const getEmployeeContracts = async (req, res) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    await syncExpiredContracts(employee._id);

    const contracts = await populateContract(
      Contract.find({ employee: employee._id }).sort({ startDate: -1 })
    );

    const activeContract = await getActiveContract(employee._id);

    res.status(200).json({
      success: true,
      count: contracts.length,
      employee: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
      activeContractId: activeContract ? activeContract._id : null,
      data: contracts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createEmployeeContract = async (req, res) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const payload = await prepareContractPayload(req.body, employee._id);

    if (payload.status === 'active' || payload.status === 'draft') {
      await validateNoOverlap(employee._id, payload.startDate, payload.endDate);
    }

    const contract = await Contract.create(payload);
    const populatedContract = await populateContract(Contract.findById(contract._id));

    if (payload.workingSchedule) {
      employee.workingSchedule = payload.workingSchedule;
      await employee.save();
    }

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: populatedContract,
    });
  } catch (error) {
    return handleContractError(error, res);
  }
};

const getActiveEmployeeContract = async (req, res) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    await syncExpiredContracts(employee._id);

    const asOfDate = req.query.asOfDate ? normalizeDate(req.query.asOfDate) : normalizeDate(new Date());
    const contract = await getActiveContract(employee._id, asOfDate);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'No active contract found for the given date',
      });
    }

    res.status(200).json({
      success: true,
      asOfDate,
      data: contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEmployeeContractForPeriod = async (req, res) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const { periodStart, periodEnd } = req.query;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        message: 'periodStart and periodEnd query parameters are required',
      });
    }

    await syncExpiredContracts(employee._id);

    const contract = await getContractForPeriod(
      employee._id,
      periodStart,
      periodEnd
    );

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'No contract found for the given payroll period',
      });
    }

    res.status(200).json({
      success: true,
      periodStart: normalizeDate(periodStart),
      periodEnd: normalizeDate(periodEnd),
      data: contract,
    });
  } catch (error) {
    return handleContractError(error, res);
  }
};

const getContractById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
      });
    }

    const contract = await populateContract(Contract.findById(req.params.contractId));

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateContract = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
      });
    }

    const existingContract = await Contract.findById(req.params.contractId);

    if (!existingContract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    const payload = await prepareContractPayload(req.body, existingContract.employee, existingContract);
    const mergedContract = { ...existingContract.toObject(), ...payload };
    const nextStatus = resolveContractStatus(mergedContract);

    payload.status = nextStatus;

    if (payload.status === 'active' || payload.status === 'draft') {
      await validateNoOverlap(
        existingContract.employee,
        mergedContract.startDate,
        mergedContract.endDate,
        existingContract._id
      );
    }

    Object.assign(existingContract, payload);
    await existingContract.save();

    if (payload.workingSchedule) {
      await Employee.findByIdAndUpdate(existingContract.employee, {
        workingSchedule: payload.workingSchedule,
      });
    }

    const populatedContract = await populateContract(Contract.findById(existingContract._id));

    res.status(200).json({
      success: true,
      message: 'Contract updated successfully',
      data: populatedContract,
    });
  } catch (error) {
    return handleContractError(error, res);
  }
};

const deleteContract = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID',
      });
    }

    const contract = await populateContract(Contract.findById(req.params.contractId));

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found',
      });
    }

    await contract.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contract deleted successfully',
      data: contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const assignScheduleToEmployee = async (req, res) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const schedule = await resolveWorkingSchedule(req.body.workingSchedule);

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: 'Working schedule is required',
      });
    }

    employee.workingSchedule = schedule;
    await employee.save();

    const populatedEmployee = await employee.populate(
      'workingSchedule',
      'name scheduleCode scheduleType weeklyHours weeklyPattern'
    );

    res.status(200).json({
      success: true,
      message: 'Working schedule assigned to employee successfully',
      data: populatedEmployee,
    });
  } catch (error) {
    return handleContractError(error, res);
  }
};

module.exports = {
  getEmployeeContracts,
  createEmployeeContract,
  getActiveEmployeeContract,
  getEmployeeContractForPeriod,
  getContractById,
  updateContract,
  deleteContract,
  assignScheduleToEmployee,
};
