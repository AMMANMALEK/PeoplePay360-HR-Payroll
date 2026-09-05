const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const { normalizeDate } = require('../utils/dateHelper');

const PERSONAL_LEAVE_TYPE_CODE = 'PERSONAL';
const PERSONAL_LEAVE_NAME = 'Personal Leave';
const PERSONAL_LEAVE_ANNUAL_DAYS = 15;

const calendarYearRange = (year) => ({
  validFrom: normalizeDate(new Date(Date.UTC(year, 0, 1))),
  validTo: normalizeDate(new Date(Date.UTC(year, 11, 31))),
});

const yearFromDate = (value) => normalizeDate(value).getUTCFullYear();

const ensurePersonalLeaveType = async (session) => {
  const options = session ? { session } : undefined;
  let typeQuery = TimeOffType.findOne({ typeCode: PERSONAL_LEAVE_TYPE_CODE });
  if (session) typeQuery = typeQuery.session(session);
  let type = await typeQuery;

  if (!type) {
    let nameQuery = TimeOffType.findOne({
      name: { $regex: /^personal leave$/i },
    });
    if (session) nameQuery = nameQuery.session(session);
    type = await nameQuery;
  }

  if (!type) {
    const created = await TimeOffType.create(
      [
        {
          typeCode: PERSONAL_LEAVE_TYPE_CODE,
          name: PERSONAL_LEAVE_NAME,
          unit: 'days',
          requiresAllocation: true,
          requiresApproval: false,
          isPaid: true,
          isActive: true,
          description: 'Annual personal leave. Automatically approved. 15 days per calendar year.',
        },
      ],
      options
    );
    type = created[0];
  } else {
    type.typeCode = PERSONAL_LEAVE_TYPE_CODE;
    type.name = PERSONAL_LEAVE_NAME;
    type.unit = 'days';
    type.requiresAllocation = true;
    type.requiresApproval = false;
    type.isPaid = true;
    type.isActive = true;
    await type.save(options);
  }

  await TimeOffType.updateMany(
    { _id: { $ne: type._id } },
    { $set: { isActive: false } },
    options
  );

  return type;
};

const ensureEmployeePersonalLeaveAllocation = async (employeeId, year = new Date().getUTCFullYear(), session) => {
  const type = await ensurePersonalLeaveType(session);
  const { validFrom, validTo } = calendarYearRange(year);
  const query = TimeOffAllocation.findOne({
    employee: employeeId,
    timeOffType: type._id,
    validFrom,
    validTo,
  });
  if (session) {
    query.session(session);
  }
  let allocation = await query;

  if (!allocation) {
    const created = await TimeOffAllocation.create(
      [
        {
          employee: employeeId,
          timeOffType: type._id,
          allocated: PERSONAL_LEAVE_ANNUAL_DAYS,
          taken: 0,
          remaining: PERSONAL_LEAVE_ANNUAL_DAYS,
          validFrom,
          validTo,
          status: 'approved',
          notes: `Personal Leave ${year}`,
        },
      ],
      session ? { session } : undefined
    );
    allocation = created[0];
  }

  return { type, allocation };
};

const findOverlappingRequest = async (employeeId, startDate, endDate, session) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const query = TimeOffRequest.findOne({
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });
  if (session) {
    query.session(session);
  }
  return query;
};

const bootstrapPersonalLeavePolicy = async () => {
  await ensurePersonalLeaveType();
};

module.exports = {
  PERSONAL_LEAVE_TYPE_CODE,
  PERSONAL_LEAVE_NAME,
  PERSONAL_LEAVE_ANNUAL_DAYS,
  calendarYearRange,
  yearFromDate,
  ensurePersonalLeaveType,
  ensureEmployeePersonalLeaveAllocation,
  findOverlappingRequest,
  bootstrapPersonalLeavePolicy,
};
