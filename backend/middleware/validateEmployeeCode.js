const EMPLOYEE_CODE_PATTERN = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

const validateEmployeeCode = (req, res, next) => {
  const raw = req.params.employeeCode;

  if (!raw || String(raw).includes('/')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  }

  if (OBJECT_ID_PATTERN.test(String(raw))) {
    return res.status(400).json({
      success: false,
      message: 'Use employeeCode in the URL (e.g. EMP-002), not MongoDB ObjectId',
    });
  }

  const employeeCode = String(raw).trim().toUpperCase();

  if (!EMPLOYEE_CODE_PATTERN.test(employeeCode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee code format',
    });
  }

  req.params.employeeCode = employeeCode;
  next();
};

module.exports = validateEmployeeCode;
