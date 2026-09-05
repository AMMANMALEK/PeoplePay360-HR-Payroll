const express = require('express');
const { getEmployeeByCode, updateEmployeeByCode } = require('../controllers/employeeController');
const {
  getEmployeeAttendance,
  createEmployeeAttendance,
  updateEmployeeAttendance,
} = require('../controllers/attendanceController');
const { getEmployeeAllocations } = require('../controllers/timeOffAllocationController');
const {
  getEmployeeTimeOffRequests,
  createEmployeeTimeOffRequest,
} = require('../controllers/timeOffRequestController');
const { getAllTimeOffTypes } = require('../controllers/timeOffTypeController');
const {
  bindAuthenticatedEmployee,
  rejectForeignEmployeeIdentity,
} = require('../middleware/bindAuthenticatedEmployee');

const forbidTimeOffReview = (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Employees cannot approve or refuse time-off requests',
  });
};

const router = express.Router();

const asAuthenticatedEmployee = (handler) => (req, res, next) => {
  req.params.employeeCode = req.currentEmployee.employeeCode;
  return handler(req, res, next);
};

router.use(bindAuthenticatedEmployee);
router.use(rejectForeignEmployeeIdentity);

const updateOwnAttendance = (req, res, next) => {
  req.params.employeeCode = req.currentEmployee.employeeCode;
  req.body = {
    checkIn: req.body?.checkIn,
    checkOut: req.body?.checkOut,
  };
  return updateEmployeeAttendance(req, res, next);
};

const updateOwnProfile = (req, res, next) => {
  req.params.employeeCode = req.currentEmployee.employeeCode;
  const rawPhone = req.body?.phone !== undefined ? String(req.body.phone).trim() : undefined;
  if (rawPhone !== undefined && rawPhone !== '') {
    if (!/^\d{10}$/.test(rawPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile phone number must be exactly 10 digits',
      });
    }
  }
  req.body = {
    phone: rawPhone,
  };
  return updateEmployeeByCode(req, res, next);
};

router.get('/profile', asAuthenticatedEmployee(getEmployeeByCode));
router.put('/profile', asAuthenticatedEmployee(updateOwnProfile));
router.get('/attendance', asAuthenticatedEmployee(getEmployeeAttendance));
router.post('/attendance', asAuthenticatedEmployee(createEmployeeAttendance));
router.put('/attendance/:attendanceId', asAuthenticatedEmployee(updateOwnAttendance));
router.get('/time-off/allocations', asAuthenticatedEmployee(getEmployeeAllocations));
router.get('/time-off/types', (req, res, next) => {
  req.query.isActive = 'true';
  return getAllTimeOffTypes(req, res, next);
});
router.get('/time-off/requests', asAuthenticatedEmployee(getEmployeeTimeOffRequests));
router.post('/time-off/requests', asAuthenticatedEmployee(createEmployeeTimeOffRequest));
router.put('/time-off/requests/:requestId/approve', forbidTimeOffReview);
router.put('/time-off/requests/:requestId/refuse', forbidTimeOffReview);
router.put('/time-off/requests/:requestId/reject', forbidTimeOffReview);

module.exports = router;
