const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { findEmployeeByCode } = require('../utils/employeeHelper');
const { findScheduleByIdentifier } = require('../utils/scheduleHelper');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const resolveManager = async (managerValue) => {
  if (managerValue === undefined || managerValue === null || managerValue === '') {
    return null;
  }

  if (isValidObjectId(managerValue)) {
    const managerEmployee = await Employee.findById(managerValue);
    if (!managerEmployee) throw new Error('MANAGER_NOT_FOUND');
    return managerEmployee._id;
  }

  const managerEmployee = await findEmployeeByCode(managerValue);
  if (managerEmployee) {
    return managerEmployee._id;
  }

  throw new Error('MANAGER_NOT_FOUND');
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

  if ('manager' in payload) {
    payload.manager = await resolveManager(payload.manager);
  }

  if ('workingSchedule' in payload) {
    payload.workingSchedule = await resolveWorkingSchedule(payload.workingSchedule);
  }

  return payload;
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
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.populate([
      { path: 'manager', select: 'firstName lastName email employeeCode department jobPosition' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours weeklyPattern' }
    ]);

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const payload = await prepareEmployeePayload(req.body);
    const employee = await Employee.create(payload);
    
    await employee.populate([
      { path: 'manager', select: 'firstName lastName email employeeCode' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours' }
    ]);

    res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
  } catch (error) {
    if (error.message === 'MANAGER_NOT_FOUND') {
      return res.status(400).json({ success: false, message: 'Manager not found.' });
    }
    if (error.message === 'SCHEDULE_NOT_FOUND') {
      return res.status(400).json({ success: false, message: 'Working schedule not found' });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

const updateEmployeeByCode = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const payload = await prepareEmployeePayload(req.body);
    Object.assign(employee, payload);
    await employee.save();
    
    await employee.populate([
      { path: 'manager', select: 'firstName lastName email employeeCode' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours' },
    ]);

    res.status(200).json({ success: true, message: 'Employee updated successfully', data: employee });
  } catch (error) {
    if (error.message === 'MANAGER_NOT_FOUND') {
      return res.status(400).json({ success: false, message: 'Manager not found.' });
    }
    if (error.message === 'SCHEDULE_NOT_FOUND') {
      return res.status(400).json({ success: false, message: 'Working schedule not found' });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

const deleteEmployeeByCode = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.deleteOne();
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
    if (error.message === 'SCHEDULE_NOT_FOUND') {
      return res.status(400).json({ success: false, message: 'Working schedule not found' });
    }
    next(error);
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
