const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const { findEmployeeByCode } = require('../utils/employeeHelper');
const { normalizeDate, endOfUtcDay } = require('../utils/dateHelper');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

const populateAttendance = (query) =>
  query.populate('employee', 'firstName lastName email employeeCode department jobPosition');

const applyAttendanceUpdates = (record, body) => {
  const { checkIn, checkOut, status, notes, attendanceDate, correction } = body;

  if (attendanceDate) {
    record.attendanceDate = normalizeDate(attendanceDate);
  }
  if (checkIn !== undefined) {
    record.checkIn = checkIn ? new Date(checkIn) : null;
  }
  if (checkOut !== undefined) {
    record.checkOut = checkOut ? new Date(checkOut) : null;
  }
  if (status) {
    record.status = status;
  }
  if (notes !== undefined) {
    record.notes = notes;
  }
  if (correction) {
    record.correction = {
      correctedBy: correction.correctedBy || 'HR Manager',
      correctedAt: correction.correctedAt ? new Date(correction.correctedAt) : new Date(),
      reason: correction.reason || notes || '',
    };
  }
};

const createEmployeeAttendance = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const { attendanceDate, checkIn, checkOut, status, notes } = req.body;

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: 'Attendance date is required',
      });
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      attendanceDate: normalizeDate(attendanceDate),
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status,
      notes,
    });

    const populatedAttendance = await Attendance.findById(attendance._id).populate(
      'employee',
      'firstName lastName email employeeCode department jobPosition'
    );

    res.status(201).json({
      success: true,
      message: 'Attendance created successfully',
      data: populatedAttendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already exists for this employee on the given date',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    if (error.message && error.message.includes('Check out time')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

const getEmployeeAttendance = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    const { status, startDate, endDate } = req.query;
    const filter = { employee: employee._id };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.attendanceDate = {};

      if (startDate) {
        filter.attendanceDate.$gte = normalizeDate(startDate);
      }

      if (endDate) {
        filter.attendanceDate.$lte = endOfUtcDay(endDate);
      }
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('employee', 'firstName lastName email employeeCode department jobPosition')
      .sort({ attendanceDate: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        employeeCode: employee.employeeCode,
      },
      data: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const { status, startDate, endDate, employeeCode } = req.query;
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

    if (startDate || endDate) {
      filter.attendanceDate = {};
      if (startDate) {
        filter.attendanceDate.$gte = normalizeDate(startDate);
      }
      if (endDate) {
        filter.attendanceDate.$lte = endOfUtcDay(endDate);
      }
    }

    const attendanceRecords = await populateAttendance(
      Attendance.find(filter).sort({ attendanceDate: -1 })
    );

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeAttendance = async (req, res, next) => {
  try {
    const employee = await findEmployeeByCode(req.params.employeeCode);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found with the given employee code',
      });
    }

    if (!isValidObjectId(req.params.attendanceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID',
      });
    }

    const record = await Attendance.findOne({
      _id: req.params.attendanceId,
      employee: employee._id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    applyAttendanceUpdates(record, req.body);
    await record.save();

    const populatedAttendance = await populateAttendance(Attendance.findById(record._id));

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: populatedAttendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already exists for this employee on the given date',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    if (error.message && error.message.includes('Check out time')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

module.exports = {
  createEmployeeAttendance,
  getEmployeeAttendance,
  getAllAttendance,
  updateEmployeeAttendance,
};
