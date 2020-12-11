const moment = require('moment-timezone');
const { split, merge, clone } = require('lodash');
const { getDateArr } = require('./Date');

const timezone = process.env.TIMEZONE;

const SHIFT = {
  day: { name: 'day', start: '06:15:00', end: '18:50:00' },
  night: { name: 'night', start: '18:50:00', end: '06:15:00' },
};

const defaultConfig = { date: moment(), toUTC: true };
function getShiftRange(shift, paramConfig = defaultConfig) {
  const config = merge(defaultConfig, paramConfig);
  let { date } = clone(config);
  let shiftStart;
  let shiftEnd;

  switch (shift) {
    case SHIFT.day.name: {
      const dateArr = getDateArr(date);

      const dayShiftStartArr = [...dateArr, ...split(SHIFT.day.start, ':')];
      shiftStart = moment.tz(dayShiftStartArr, timezone);

      const dayShiftEndArr = [...dateArr, ...split(SHIFT.day.end, ':')];
      shiftEnd = moment.tz(dayShiftEndArr, timezone);

      break;
    }
    case SHIFT.night.name: {
      const startDateArr = getDateArr(date);
      const endDate = date.add(1, 'd');
      const endDateArr = getDateArr(endDate);

      const nightShiftStartArr = [...startDateArr, ...split(SHIFT.night.start, ':')];
      shiftStart = moment.tz(nightShiftStartArr, timezone);

      const nightShiftEndArr = [...endDateArr, ...split(SHIFT.night.end, ':')];
      shiftEnd = moment.tz(nightShiftEndArr, timezone);

      break;
    }
    default:
      throw new Error(`Unknown shift: ${shift}`);
  }

  if (config.toUTC) {
    date = date.utc();
    shiftStart = shiftStart.utc();
    shiftEnd = shiftEnd.utc();
  }

  return {
    start: shiftStart.format(),
    end: shiftEnd.format(),
  };
}

function getCurrentShiftRangeName() {
  const currentTime = moment().tz(timezone);
  const dayShiftStart = moment.tz(SHIFT.day.start, 'HH:mm:ss', timezone);
  const dayShiftEnd = moment.tz(SHIFT.day.end, 'HH:mm:ss', timezone);

  if (currentTime.isBetween(dayShiftStart, dayShiftEnd)) {
    return SHIFT.day.name;
  }

  return SHIFT.night.name;
}

function getLastDayShiftRange(toUTC = true) {
  const currentTime = moment().tz(timezone);
  let shiftStart = moment.tz(SHIFT.day.start, 'HH:mm:ss', timezone);
  let shiftEnd = moment.tz(SHIFT.day.end, 'HH:mm:ss', timezone);

  if (!currentTime.isAfter(shiftEnd)) {
    // Last completed day shift is from yesterday
    shiftStart = shiftStart.subtract(1, 'd');
    shiftEnd = shiftEnd.subtract(1, 'd');
  }

  if (toUTC) {
    shiftStart = shiftStart.utc();
    shiftEnd = shiftEnd.utc();
  }

  return {
    start: shiftStart.format(),
    end: shiftEnd.format(),
  };
}

function getLastNightShiftRange(toUTC = true) {
  const currentTime = moment().tz(timezone);

  // Last completed day shift started at least a day ago
  let shiftStart = moment.tz(SHIFT.night.start, 'HH:mm:ss', timezone).subtract(1, 'd');
  let shiftEnd = moment.tz(SHIFT.night.end, 'HH:mm:ss', timezone);

  if (currentTime.isBefore(shiftEnd)) {
    // Between midnight and the shift end,
    // last completed night shift is from a day before
    shiftStart = shiftStart.subtract(1, 'd');
    shiftEnd = shiftEnd.subtract(1, 'd');
  }

  if (toUTC) {
    shiftStart = shiftStart.utc();
    shiftEnd = shiftEnd.utc();
  }

  return {
    start: shiftStart.format(),
    end: shiftEnd.format(),
  };
}

module.exports = {
  SHIFT,
  getShiftRange,
  getCurrentShiftRangeName,
  getLastDayShiftRange,
  getLastNightShiftRange,
};
