const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value) &&
  String(value).length === 24;

const findEmployeeByCode = async (employeeCode) => {
  if (!employeeCode || !String(employeeCode).trim()) {
    return null;
  }

  return Employee.findOne({
    employeeCode: String(employeeCode).trim().toUpperCase(),
  });
};

const findEmployeeByCodeOrId = async (value) => {
  if (!value) {
    return null;
  }

  if (isValidObjectId(value)) {
    return Employee.findById(value);
  }

  return findEmployeeByCode(value);
};

const DEFAULT_MANAGER_CODE = String(process.env.DEFAULT_MANAGER_EMPLOYEE_CODE || 'HRMGR')
  .trim()
  .toUpperCase();

const getDefaultManagerEmployee = async () => {
  const email = String(process.env.HR_MANAGER_EMAIL || '').trim().toLowerCase();

  let manager = null;
  if (email) {
    manager = await Employee.findOne({ email });
  }
  if (!manager && DEFAULT_MANAGER_CODE) {
    manager = await findEmployeeByCode(DEFAULT_MANAGER_CODE);
  }
  if (manager) {
    return manager;
  }

  try {
    return await Employee.create({
      employeeCode: DEFAULT_MANAGER_CODE || 'HRMGR',
      firstName: 'HR',
      lastName: 'Manager',
      email: email || 'hr.manager@peoplepay360.local',
      department: 'Human Resources',
      jobPosition: 'HR Manager',
      status: 'active',
    });
  } catch (error) {
    if (error.code === 11000) {
      if (email) {
        manager = await Employee.findOne({ email });
        if (manager) return manager;
      }
      return findEmployeeByCode(DEFAULT_MANAGER_CODE || 'HRMGR');
    }
    throw error;
  }
};

module.exports = {
  isValidObjectId,
  findEmployeeByCode,
  findEmployeeByCodeOrId,
  getDefaultManagerEmployee,
};
