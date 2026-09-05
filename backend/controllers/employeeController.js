const mongoose = require('mongoose');
const Employee = require('../models/Employee');
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
    if (!managerEmployee) {
      const error = new Error('MANAGER_NOT_FOUND');
      throw error;
    }
    return managerEmployee._id;
  }

  const managerName = String(managerValue).trim();
  const nameParts = managerName.split(/\s+/);

  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    const managerEmployee = await Employee.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName}$`, 'i') },
    });

    if (managerEmployee) {
      return managerEmployee._id;
    }
  }

  const managerEmployee = await Employee.findOne({
    $or: [
      { firstName: { $regex: new RegExp(`^${managerName}$`, 'i') } },
      { lastName: { $regex: new RegExp(`^${managerName}$`, 'i') } },
    ],
  });

  if (managerEmployee) {
    return managerEmployee._id;
  }

  const error = new Error('MANAGER_NOT_FOUND');
  throw error;
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

const getAllEmployees = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName email employeeCode department jobPosition')
      .populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours weeklyPattern');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createEmployee = async (req, res) => {
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
    if (error.message === 'MANAGER_NOT_FOUND') {
      return res.status(400).json({
        success: false,
        message:
          'Manager not found. Use an existing employee ID or full name, or omit manager.',
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
        message:
          'Invalid data format. Manager must be a valid employee ID or existing manager name.',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const payload = await prepareEmployeePayload(req.body);
    const employee = await Employee.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'manager', select: 'firstName lastName email employeeCode' },
      { path: 'workingSchedule', select: 'name scheduleCode scheduleType weeklyHours' },
    ]);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    if (error.message === 'MANAGER_NOT_FOUND') {
      return res.status(400).json({
        success: false,
        message:
          'Manager not found. Use an existing employee ID or full name, or omit manager.',
      });
    }

    if (error.message === 'SCHEDULE_NOT_FOUND') {
      return res.status(400).json({
        success: false,
        message: 'Working schedule not found',
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
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

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
