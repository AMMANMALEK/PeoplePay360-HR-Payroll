const Employee = require('../models/Employee');

const findEmployeeByCode = async (employeeCode) => {
  if (!employeeCode || !String(employeeCode).trim()) {
    return null;
  }

  return Employee.findOne({
    employeeCode: String(employeeCode).trim().toUpperCase(),
  });
};

module.exports = {
  findEmployeeByCode,
};
