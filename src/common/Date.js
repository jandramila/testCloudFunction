const moment = require('moment');

function currentIsoString() { 
  return moment().toISOString();
}

function formatUtcStringDate(date, format) {
  return moment.utc(date).format(format);
}

function formatUtcDate(format) {
  return moment.utc().format(format);
}

function formatDate(days, format) {
  let date = moment();
  if (days) {
    date = date.day(days);
  }
  
  return date.format(format);
}

function parseStringToDate(date, format) {
  return moment(date, format);
}

function daysAgo(dateString, format) {
  const date = parseStringToDate(dateString, format);
  return moment().diff(date, 'days');
}

function weeksAgo(dateString, format) {
  const date = parseStringToDate(dateString, format);
  return moment().diff(date, 'weeks');
}

module.exports = {
  currentIsoString,
  formatUtcStringDate,
  formatDate,
  formatUtcDate,
  parseStringToDate,
  daysAgo,
  weeksAgo
};