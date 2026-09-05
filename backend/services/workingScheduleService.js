const parseTimeToMinutes = (timeValue) => {
  const [hours, minutes] = String(timeValue).split(':').map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('INVALID_TIME_FORMAT');
  }

  return hours * 60 + minutes;
};

const calculateDayHours = (dayEntry) => {
  const startMinutes = parseTimeToMinutes(dayEntry.startTime);
  const endMinutes = parseTimeToMinutes(dayEntry.endTime);
  const breakMinutes = dayEntry.breakMinutes || 0;

  if (endMinutes <= startMinutes) {
    throw new Error('INVALID_DAY_HOURS');
  }

  const workedMinutes = endMinutes - startMinutes - breakMinutes;

  if (workedMinutes < 0) {
    throw new Error('INVALID_BREAK_MINUTES');
  }

  return Math.round((workedMinutes / 60) * 100) / 100;
};

const calculateWeeklyHours = (weeklyPattern = []) => {
  if (!weeklyPattern.length) {
    return 0;
  }

  const total = weeklyPattern.reduce((sum, dayEntry) => sum + calculateDayHours(dayEntry), 0);
  return Math.round(total * 100) / 100;
};

module.exports = {
  calculateWeeklyHours,
  calculateDayHours,
  parseTimeToMinutes,
};
