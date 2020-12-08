const { GoogleSpreadsheet } = require('google-spreadsheet');

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
  const spreadsheet = await getSpreadsheet(process.env.PROJECT_STATUS_SPREADSHEET_ID);
  const sheet = spreadsheet.sheetsByIndex[index];
  await sheet.loadCells(dataRange);
  const rows = await sheet.getRows();
  return { sheet, rows }
}

module.exports = {
  getSpreadsheet,
  getSheet,
};