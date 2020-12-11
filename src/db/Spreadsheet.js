const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const util = require('util');
const path = require('path');
const { forEach, get } = require('lodash');
// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

const ROW_OFFSET = 2;

async function getSheetConfig() {
  const raw = await readFile(path.join(process.cwd(), 'sheet-config.json'));
  const config = JSON.parse(raw);
  return config;
}

async function getSpreadsheet(id) {
  const doc = new GoogleSpreadsheet(id);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();

  return doc;
}

async function getSheet(index, dataRange) {
  const spreadsheet = await getSpreadsheet(process.env.PRODUCTION_SPREADHSEET_ID);
  const sheet = spreadsheet.sheetsByIndex[index];
  await sheet.loadCells(dataRange);
  const rows = await sheet.getRows();
  return { sheet, rows };
}

function setShiftRecords(configuredRows, column, rows, records) {
  let sum = 0;
  forEach(configuredRows, (fields, machine) => {
    forEach(fields, async (fieldRow, field) => {
      // [Offset] row 1 = header & row 2 = 0
      const row = fieldRow - ROW_OFFSET;

      const counter = get(records, [machine, field], null);
      if (counter) {
        sum += parseInt(counter);

        // Insert by Machine.Field & Date
        rows[row][column] = counter;
        await rows[row].save();
      }
    });
  });
  return sum;
}

async function setShiftTotal(totalRow, column, rows, total) {
  const totalCountRow = totalRow - ROW_OFFSET;
  rows[totalCountRow][column] = total;
  return rows[totalCountRow].save();
}

module.exports = {
  ROW_OFFSET,
  getSheetConfig,
  getSpreadsheet,
  getSheet,
  setShiftRecords,
  setShiftTotal,
};
