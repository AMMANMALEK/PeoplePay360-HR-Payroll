const normalizeDate = (value) => {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const endOfUtcDay = (value) => {
  const date = normalizeDate(value);
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

module.exports = {
  normalizeDate,
  endOfUtcDay,
};
