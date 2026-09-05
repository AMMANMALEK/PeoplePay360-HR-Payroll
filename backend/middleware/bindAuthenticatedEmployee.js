const Employee = require('../models/Employee');

const bindAuthenticatedEmployee = async (req, res, next) => {
  try {
    const employeeId = req.auth?.employeeId;

    if (!employeeId) {
      return res.status(403).json({
        success: false,
        message: 'No employee record is linked to this account',
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(403).json({
        success: false,
        message: 'No employee record is linked to this account',
      });
    }

    const status = String(employee.status || 'active').toLowerCase();
    if (status === 'inactive' || status === 'terminated') {
      return res.status(403).json({
        success: false,
        message: 'This employee account is not active',
      });
    }

    req.params.employeeCode = employee.employeeCode;
    req.currentEmployee = employee;
    return next();
  } catch (error) {
    return next(error);
  }
};

const rejectForeignEmployeeIdentity = (req, res, next) => {
  const claimedValues = [
    req.body?.employee_id,
    req.body?.employeeId,
    req.body?.employeeCode,
    req.body?.employee,
    req.query?.employee_id,
    req.query?.employeeId,
    req.query?.employeeCode,
  ].filter((value) => value !== undefined && value !== null && value !== '');

  if (claimedValues.length === 0) {
    return next();
  }

  const allowed = new Set(
    [
      req.auth?.employeeId,
      req.auth?.employeeCode,
      req.currentEmployee?._id?.toString(),
      req.currentEmployee?.employeeCode,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
  );

  const hasForeignIdentity = claimedValues.some((value) => {
    const claimed =
      typeof value === 'object'
        ? value._id || value.employeeCode || value.employee_id || value.id
        : value;
    return claimed && !allowed.has(String(claimed).toLowerCase());
  });

  if (hasForeignIdentity) {
    return res.status(403).json({
      success: false,
      message: 'You cannot act on another employee record',
    });
  }

  return next();
};

module.exports = {
  bindAuthenticatedEmployee,
  rejectForeignEmployeeIdentity,
};
