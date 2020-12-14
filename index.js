require('dotenv').config();
const moment = require('moment-timezone');
const { map, split, clone, upperCase } = require('lodash');
const { Spreadsheet, Timeseries } = require('./src/db');
const { SHIFT, getLastDayShiftRange, getLastNightShiftRange, getShiftRange } = require('./src/common/Shift');
const { logger } = require('./src/logging');

const { getAllFieldsByMachine } = Timeseries;
const { getSheet, getSheetConfig, setShiftRecords, setShiftTotal } = Spreadsheet;

const timezone = process.env.TIMEZONE;

async function dayShiftFeedJob() {
  try {
    logger.info(`[DAY SHIFT JOB] Starting`);
    const shiftRange = getLastDayShiftRange();

    // Config, Records & Spreadsheet object calls in parallel
    const [{ DayShiftRows, TotalDayShiftRow }, timeseries, { rows }] = await Promise.all([
      getSheetConfig(),
      getAllFieldsByMachine(shiftRange),
      getSheet(0, 'A1:HO50'),
    ]);

    const dateHumanRead = moment(shiftRange.start).tz(timezone).format('D-MMM-YY');
    const machines = map(timeseries, (f, machine) => machine).join(', ');

    // Look for configured fields & machines
    const total = setShiftRecords(DayShiftRows, dateHumanRead, rows, timeseries);
    await setShiftTotal(TotalDayShiftRow, dateHumanRead, rows, total);

    logger.info(`[DAY SHIFT JOB] Completed - Records set for machines: ${machines}. Total: ${total}`);
  } catch (error) {
    logger.error(error);
  }
}

async function nightShiftFeedJob() {
  try {
    logger.info(`[NIGHT SHIFT JOB] Starting`);
    const shiftRange = getLastNightShiftRange();

    // Config, Records & Spreadsheet object calls in parallel
    const [{ NightShiftRows, TotalNightShiftRow }, timeseries, { rows }] = await Promise.all([
      getSheetConfig(),
      getAllFieldsByMachine(shiftRange),
      getSheet(0, 'A1:HO50'),
    ]);

    const dateHumanRead = moment(shiftRange.start).tz(timezone).format('D-MMM-YY');
    const machines = map(timeseries, (f, machine) => machine).join(', ');

    // Look for configured fields & machines
    const total = setShiftRecords(NightShiftRows, dateHumanRead, rows, timeseries);
    await setShiftTotal(TotalNightShiftRow, dateHumanRead, rows, total);

    logger.info(`[NIGHT SHIFT JOB] Completed - Records set for machines: ${machines}. Total: ${total}`);
  } catch (error) {
    logger.error(error);
  }
}

module.exports = {
  dayShiftFeedJob,
  nightShiftFeedJob,
};
