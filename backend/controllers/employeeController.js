const Employee = require('../models/Employee');
const { findScheduleByIdentifier } = require('../utils/scheduleHelper');
const { findEmployeeByCode, findEmployeeByCodeOrId } = require('../utils/employeeHelper');

const resolveManager = async (managerValue) => {
  if (managerValue === undefined || managerValue === null || managerValue === '') {
    return null;
  }

  const managerEmployee = await findEmployeeByCodeOrId(managerValue);

  if (!managerEmployee) {
    const error = new Error('MANAGER_NOT_FOUND');
    throw error;
  }

  return managerEmployee._id;
};

const prepareEmployeePayload = async (body) => {
  const payload = { ...body };

  if ('manager' in payload) {
    payload.manager = await resolveManager(payload.manager);
  }

  if ('workingSchedule' in payload) {
    if (payload.workingSchedule === null || payload.workingSchedule === '') {
      payload.workingSchedule = null;
    } else {
      const schedule = await findScheduleByIdentifier(payload.workingSchedule);

      if (!schedule) {
        const error = new Error('SCHEDULE_NOT_FOUND');
        throw error;
      }

      payload.workingSchedule = schedule._id;
    }
  }

  return payload;
};

const handleEmployeeError = (error, res, next) => {
  if (error.message === 'MANAGER_NOT_FOUND') {
    return res.status(400).json({
      success: false,
      message: 'Manager not found. Use an existing employeeCode, or omit manager.',
    });
  }

  if (error.message === 'SCHEDULE_NOT_FOUND') {
    return res.status(400).json({
      success: false,
      message: 'Working schedule not found',
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

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format. Manager must be a valid employeeCode.',
    });
  }

  return next(error);
};

const getAllEmployees = async (req, res, next) => {
  try {
    const { status, department, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter)
      .populate('manager', 'firstName lastName email employeeCode')
      .populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeByCode = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    await employee.populate('manager', 'firstName lastName email employeeCode department jobPosition');
    await employee.populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours weeklyPattern');

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const payload = await prepareEmployeePayload(req.body);
    const employee = await Employee.create(payload);
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('manager', 'firstName lastName email employeeCode')
      .populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populatedEmployee,
    });
  } catch (error) {
    return handleEmployeeError(error, res, next);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const payload = await prepareEmployeePayload(req.body);
    const employee = await Employee.findOneAndUpdate(
      { employeeCode: req.params.employeeCode },
      payload,
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      { path: 'manager', select: 'firstName lastName email employeeCode' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours' },
    ]);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    return handleEmployeeError(error, res, next);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndDelete({
      employeeCode: req.params.employeeCode,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeByCode,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
