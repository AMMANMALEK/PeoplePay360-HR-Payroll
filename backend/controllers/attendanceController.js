const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { findEmployeeByCode } = require('../utils/employeeHelper');

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const createEmployeeAttendance = async (req, res) => {
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

    if (error.message === 'Check out time must be after check in time') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEmployeeAttendance = async (req, res) => {
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
        const end = normalizeDate(endDate);
        end.setHours(23, 59, 59, 999);
        filter.attendanceDate.$lte = end;
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEmployeeAttendance,
  getEmployeeAttendance,
};
