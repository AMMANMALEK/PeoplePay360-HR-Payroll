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

module.exports = {
  isValidObjectId,
  findEmployeeByCode,
  findEmployeeByCodeOrId,
};
