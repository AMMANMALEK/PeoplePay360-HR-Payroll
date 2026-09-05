const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const { normalizeDate } = require('../utils/dateHelper');

const PERSONAL_LEAVE_TYPE_CODE = 'PERSONAL';
const PERSONAL_LEAVE_NAME = 'Personal Leave';
const PERSONAL_LEAVE_ANNUAL_DAYS = 15;

const LEAVE_TYPES_CONFIG = [
  {
    typeCode: 'PERSONAL',
    name: 'Personal Leave',
    unit: 'days',
    annualDays: 15,
    requiresAllocation: true,
    requiresApproval: false,
    isPaid: true,
    description: 'Annual personal leave. Automatically approved. 15 days per calendar year.',
  },
  {
    typeCode: 'SICK',
    name: 'Sick Leave',
    unit: 'days',
    annualDays: 10,
    requiresAllocation: true,
    requiresApproval: false,
    isPaid: true,
    description: 'Sick leave allowance. 10 days per calendar year. Requestable within March to two quarters.',
  },
  {
    typeCode: 'FESTIVAL',
    name: 'Festival Leave',
    unit: 'days',
    annualDays: 5,
    requiresAllocation: true,
    requiresApproval: false,
    isPaid: true,
    description: 'Festival and holiday leave. 5 days per calendar year.',
  },
];

const calendarYearRange = (year) => ({
  validFrom: normalizeDate(new Date(Date.UTC(year, 0, 1))),
  validTo: normalizeDate(new Date(Date.UTC(year, 11, 31))),
});

const yearFromDate = (value) => normalizeDate(value).getUTCFullYear();

const ensureStandardLeaveTypes = async (session) => {
  const options = session ? { session } : undefined;
  const resultTypes = {};

  for (const cfg of LEAVE_TYPES_CONFIG) {
    let typeQuery = TimeOffType.findOne({
      $or: [
        { typeCode: cfg.typeCode },
        { name: { $regex: new RegExp(`^${cfg.name}$`, 'i') } },
      ],
    });
    if (session) typeQuery = typeQuery.session(session);
    let type = await typeQuery;

    if (!type) {
      const created = await TimeOffType.create(
        [
          {
            typeCode: cfg.typeCode,
            name: cfg.name,
            unit: cfg.unit,
            requiresAllocation: cfg.requiresAllocation,
            requiresApproval: cfg.requiresApproval,
            isPaid: cfg.isPaid,
            isActive: true,
            description: cfg.description,
          },
        ],
        options
      );
      type = created[0];
    } else {
      type.typeCode = cfg.typeCode;
      type.name = cfg.name;
      type.unit = cfg.unit;
      type.requiresAllocation = cfg.requiresAllocation;
      type.requiresApproval = cfg.requiresApproval;
      type.isPaid = cfg.isPaid;
      type.isActive = true;
      type.description = cfg.description;
      await type.save(options);
    }
    resultTypes[cfg.typeCode] = type;
  }

  return resultTypes;
};

const ensurePersonalLeaveType = async (session) => {
  const types = await ensureStandardLeaveTypes(session);
  return types.PERSONAL;
};

const ensureEmployeeLeaveAllocations = async (
  employeeId,
  year = new Date().getUTCFullYear(),
  session
) => {
  const types = await ensureStandardLeaveTypes(session);
  const { validFrom, validTo } = calendarYearRange(year);
  const allocations = {};

  for (const cfg of LEAVE_TYPES_CONFIG) {
    const type = types[cfg.typeCode];
    let query = TimeOffAllocation.findOne({
      employee: employeeId,
      timeOffType: type._id,
      validFrom,
      validTo,
    });
    if (session) query = query.session(session);
    let allocation = await query;

    if (!allocation) {
      const created = await TimeOffAllocation.create(
        [
          {
            employee: employeeId,
            timeOffType: type._id,
            allocated: cfg.annualDays,
            taken: 0,
            remaining: cfg.annualDays,
            validFrom,
            validTo,
            status: 'approved',
            notes: `${cfg.name} ${year}`,
          },
        ],
        session ? { session } : undefined
      );
      allocation = created[0];
    }
    allocations[cfg.typeCode] = { type, allocation };
  }

  return allocations;
};

const ensureEmployeePersonalLeaveAllocation = async (
  employeeId,
  year = new Date().getUTCFullYear(),
  session
) => {
  const allAllocations = await ensureEmployeeLeaveAllocations(employeeId, year, session);
  return allAllocations.PERSONAL;
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
  await ensureStandardLeaveTypes();
};

module.exports = {
  PERSONAL_LEAVE_TYPE_CODE,
  PERSONAL_LEAVE_NAME,
  PERSONAL_LEAVE_ANNUAL_DAYS,
  LEAVE_TYPES_CONFIG,
  calendarYearRange,
  yearFromDate,
  ensureStandardLeaveTypes,
  ensurePersonalLeaveType,
  ensureEmployeeLeaveAllocations,
  ensureEmployeePersonalLeaveAllocation,
  findOverlappingRequest,
  bootstrapPersonalLeavePolicy,
};
