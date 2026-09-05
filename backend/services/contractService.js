const Contract = require('../models/Contract');
const { normalizeDate } = require('../utils/dateHelper');

const getFarFutureDate = () => new Date('9999-12-31T23:59:59.999Z');

const getRangeEnd = (endDate) => (endDate ? normalizeDate(endDate) : getFarFutureDate());

const rangesOverlap = (firstStart, firstEnd, secondStart, secondEnd) => {
  const startA = normalizeDate(firstStart);
  const endA = getRangeEnd(firstEnd);
  const startB = normalizeDate(secondStart);
  const endB = getRangeEnd(secondEnd);

  return startA < endB && startB < endA;
};

const findOverlappingContracts = async (employeeId, startDate, endDate, excludeContractId = null) => {
  const filter = {
    employee: employeeId,
    status: { $in: ['active', 'draft'] },
  };

  if (excludeContractId) {
    filter._id = { $ne: excludeContractId };
  }

  const contracts = await Contract.find(filter);
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = endDate ? normalizeDate(endDate) : null;

  return contracts.filter((contract) =>
    rangesOverlap(normalizedStart, normalizedEnd, contract.startDate, contract.endDate)
  );
};

const validateNoOverlap = async (employeeId, startDate, endDate, excludeContractId = null) => {
  const overlaps = await findOverlappingContracts(
    employeeId,
    startDate,
    endDate,
    excludeContractId
  );

  if (overlaps.length > 0) {
    const error = new Error('CONTRACT_OVERLAP');
    error.overlappingContracts = overlaps.map((contract) => ({
      _id: contract._id,
      contractCode: contract.contractCode,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
    }));
    throw error;
  }
};

const resolveContractStatus = (contractData, referenceDate = new Date()) => {
  const today = normalizeDate(referenceDate);
  const startDate = normalizeDate(contractData.startDate);
  const endDate = contractData.endDate ? normalizeDate(contractData.endDate) : null;

  if (contractData.status === 'terminated') {
    return 'terminated';
  }

  if (endDate && endDate < today) {
    return 'expired';
  }

  if (startDate > today) {
    return 'draft';
  }

  return contractData.status === 'draft' ? 'draft' : 'active';
};

const getActiveContract = async (employeeId, asOfDate = new Date()) => {
  const date = normalizeDate(asOfDate);

  const contracts = await Contract.find({
    employee: employeeId,
    status: { $in: ['active'] },
    startDate: { $lte: date },
    $or: [{ endDate: null }, { endDate: { $gte: date } }],
  })
    .populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours weeklyPattern')
    .sort({ startDate: -1 });

  return contracts[0] || null;
};

const getContractForPeriod = async (employeeId, periodStart, periodEnd) => {
  const start = normalizeDate(periodStart);
  const end = normalizeDate(periodEnd);

  if (start > end) {
    const error = new Error('INVALID_PERIOD');
    throw error;
  }

  const contracts = await Contract.find({
    employee: employeeId,
    status: { $in: ['active', 'expired'] },
    startDate: { $lte: end },
    $or: [{ endDate: null }, { endDate: { $gte: start } }],
  })
    .populate('workingSchedule', 'name scheduleCode scheduleType weeklyHours weeklyPattern')
    .sort({ startDate: -1 });

  if (contracts.length === 0) {
    return null;
  }

  if (contracts.length > 1) {
    const error = new Error('AMBIGUOUS_CONTRACT');
    error.matchingContracts = contracts.map((contract) => ({
      _id: contract._id,
      contractCode: contract.contractCode,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
    }));
    throw error;
  }

  return contracts[0];
};

const syncExpiredContracts = async (employeeId) => {
  const today = normalizeDate(new Date());

  await Contract.updateMany(
    {
      employee: employeeId,
      status: 'active',
      endDate: { $ne: null, $lt: today },
    },
    { status: 'expired' }
  );
};

module.exports = {
  normalizeDate,
  validateNoOverlap,
  resolveContractStatus,
  getActiveContract,
  getContractForPeriod,
  syncExpiredContracts,
  findOverlappingContracts,
};
