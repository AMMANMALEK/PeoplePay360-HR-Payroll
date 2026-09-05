const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { findEmployeeByCode, findEmployeeByCodeOrId, getDefaultManagerEmployee } = require('../utils/employeeHelper');
const { findScheduleByIdentifier } = require('../utils/scheduleHelper');
const {
  assertEmailAvailable,
  provisionEmployeeAccount,
  syncEmployeeAccountEmail,
  deleteEmployeeAccount,
} = require('../services/employeeAccountService');
const { ensureEmployeePersonalLeaveAllocation } = require('../services/personalLeavePolicy');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

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

const resolveWorkingSchedule = async (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const schedule = await findScheduleByIdentifier(value);
  if (!schedule) throw new Error('SCHEDULE_NOT_FOUND');
  
  return schedule._id;
};

const prepareEmployeePayload = async (body) => {
  const payload = { ...body };
  delete payload.password;
  delete payload.passwordHash;
  delete payload.role;

  if ('manager' in payload) {
    payload.manager = await resolveManager(payload.manager);
  }

  if ('workingSchedule' in payload) {
    payload.workingSchedule = await resolveWorkingSchedule(payload.workingSchedule);
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

  if (error.message === 'EMAIL_IN_USE') {
    return res.status(409).json({
      success: false,
      message: 'This email is already associated with an employee account.',
    });
  }

  if (error.message === 'EMAIL_RESERVED') {
    return res.status(409).json({
      success: false,
      message: 'This email is already associated with an employee account.',
    });
  }

  if (error.message === 'EMAIL_REQUIRED') {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || { email: 1 })[0];
    if (field === 'email') {
      return res.status(409).json({
        success: false,
        message: 'This email is already associated with an employee account.',
      });
    }
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

    if (status) filter.status = status;
    if (department) filter.department = department;
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

    res.status(200).json({ success: true, count: employees.length, data: employees });
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
    if (!payload.manager) {
      const defaultManager = await getDefaultManagerEmployee();
      const creatingSelf =
        defaultManager &&
        ((payload.employeeCode &&
          String(payload.employeeCode).trim().toUpperCase() === defaultManager.employeeCode) ||
          (payload.email &&
            String(payload.email).trim().toLowerCase() === String(defaultManager.email || '').toLowerCase()));
      if (defaultManager && !creatingSelf) {
        payload.manager = defaultManager._id;
      }
    }

    const employee = await mongoose.connection.transaction(async (session) => {
      await assertEmailAvailable(payload.email, { session });
      const [created] = await Employee.create([payload], { session });
      await provisionEmployeeAccount(created, session);
      return created;
    });

    await ensureEmployeePersonalLeaveAllocation(employee._id);

    await employee.populate([
      { path: 'manager', select: 'firstName lastName email employeeCode' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours' }
    ]);

    res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
  } catch (error) {
    return handleEmployeeError(error, res, next);
  }
};

const updateEmployeeByCode = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const payload = await prepareEmployeePayload(req.body);
    const previousEmail = employee.email;
    Object.assign(employee, payload);

    await mongoose.connection.transaction(async (session) => {
      if (employee.email && employee.email !== previousEmail) {
        await assertEmailAvailable(employee.email, {
          session,
          excludeEmployeeId: employee._id,
        });
      }
      await employee.save({ session });
      await syncEmployeeAccountEmail(employee, session);
    });
    
    await employee.populate([
      { path: 'manager', select: 'firstName lastName email employeeCode' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    return handleEmployeeError(error, res, next);
  }
};

const deleteEmployeeByCode = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    await mongoose.connection.transaction(async (session) => {
      await deleteEmployeeAccount(employee, session);
      await employee.deleteOne({ session });
    });
    res.status(200).json({ success: true, message: 'Employee deleted successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

const assignScheduleToEmployee = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const scheduleId = await resolveWorkingSchedule(req.body.workingSchedule);

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'Working schedule is required',
      });
    }

    employee.workingSchedule = scheduleId;
    await employee.save();

    await employee.populate(
      'workingSchedule',
      'name scheduleCode scheduleType weeklyHours weeklyPattern'
    );

    res.status(200).json({
      success: true,
      message: 'Working schedule assigned to employee successfully',
      data: employee,
    });
  } catch (error) {
    return handleEmployeeError(error, res, next);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeByCode,
  createEmployee,
  updateEmployeeByCode,
  deleteEmployeeByCode,
  assignScheduleToEmployee
};
