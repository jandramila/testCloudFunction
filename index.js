require('dotenv').config();
const moment = require('moment-timezone');
const { Spreadsheet, Timeseries } = require('../db');
const { map, split, clone, upperCase } = require('lodash');
const { logger } = require('../logging');
const { SHIFT, getLastDayShiftRange, getLastNightShiftRange, getShiftRange } = require('../common/Shift');

const { getAllFieldsByMachine } = Timeseries;
const { getSheet, getSheetConfig, setShiftRecords, setShiftTotal } = Spreadsheet;

const timezone = process.env.TIMEZONE;

async function shiftFeedJob(shiftRange) {
  // Config, Records & Spreadsheet object calls in parallel
  const [{ DayShiftRows, TotalDayShiftRow }, timeseries, { rows }] = await Promise.all([
    getSheetConfig(),
    getAllFieldsByMachine(shiftRange),
    getSheet(0, 'A1:HO50'),
  ]);

  const dateHumanRead = moment(shiftRange.start).tz(timezone).format('D-MMM-YY');

  // Look for configured fields & machines
  const total = setShiftRecords(DayShiftRows, dateHumanRead, rows, timeseries);
  await setShiftTotal(TotalDayShiftRow, dateHumanRead, rows, total);

  return {
    machines: map(timeseries, (f, machine) => machine).join(', '),
    total,
  };
}

async function dayShiftFeedJob() {
  try {
    logger.info(`[DAY SHIFT JOB] Starting`);
    const shiftRange = getLastDayShiftRange();
    const { machines, total } = await shiftFeedJob(shiftRange);
    logger.info(`[DAY SHIFT JOB] Completed - Records set for machines: ${machines}. Total: ${total}`);
  } catch (error) {
    logger.error(error);
  }
}

async function nightShiftFeedJob() {
  try {
    logger.info(`[NIGHT SHIFT JOB] Starting`);
    const shiftRange = getLastNightShiftRange();
    const { machines, total } = await shiftFeedJob(shiftRange);
    logger.info(`[NIGHT SHIFT JOB] Completed - Records set for machines: ${machines}. Total: ${total}`);
  } catch (error) {
    logger.error(error);
  }
}

async function shiftPeriodsJob(message) {
  try {
    const params = Buffer.from(message.data, 'base64').toString();
    let [from, to, shift = null] = split(params, ',');
    const logMessage = from === to ? from : `period ${from} - ${to}`;

    [from, to] = map([from, to], (date) => moment.tz(date, 'YYYY-MM-DD', timezone));
    shift = shift || SHIFT.day.name;
    const upperShift = upperCase(shift);

    console.log(`[${upperShift} SHIFT PERIOD JOB] Requested for ${logMessage}`);

    for (const date = clone(from); !date.isAfter(to); date.add(1, 'd')) {
      const shiftRange = getShiftRange(shift, { date });
      const { machines, total } = await shiftFeedJob(shiftRange);

      console.log(
        `[${upperShift} SHIFT PERIOD JOB] Completed - Records set for machines: ${machines}. Total: ${total}`
      );
    }

    console.log(`[${upperShift} SHIFT PERIOD JOB] Completed for ${logMessage}`);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  dayShiftFeedJob,
  nightShiftFeedJob,
  shiftPeriodsJob,
};
