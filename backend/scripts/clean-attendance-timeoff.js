require('dotenv').config();

const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const TimeOffRequest = require('../models/TimeOffRequest');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const { getDefaultManagerEmployee } = require('../utils/employeeHelper');

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const defaultManager = await getDefaultManagerEmployee();
  const attendance = await Attendance.deleteMany({});
  const requests = await TimeOffRequest.deleteMany({});
  const allocations = await TimeOffAllocation.updateMany(
    {},
    [
      {
        $set: {
          taken: 0,
          remaining: '$allocated',
        },
      },
    ]
  );

  console.log(
    JSON.stringify({
      attendanceDeleted: attendance.deletedCount,
      timeOffRequestsDeleted: requests.deletedCount,
      allocationsReset: allocations.modifiedCount,
      defaultManager: defaultManager
        ? `${defaultManager.employeeCode} ${defaultManager.firstName} ${defaultManager.lastName}`
        : null,
    })
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
