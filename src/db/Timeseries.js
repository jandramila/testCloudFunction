const { InfluxDB } = require('@influxdata/influxdb-client');
const { map, merge, reduce } = require('lodash');
const { getSpreadQuery } = require('./Flux');

const organization = process.env.TIMESERIES_DB_ORGANIZATION;

const queryApi = new InfluxDB({
  url: process.env.TIMESERIES_DB_URL || 'localhost:8086',
  token: process.env.TIMESERIES_DB_TOKEN,
}).getQueryApi(organization);

const fields = ['track_1_pusher', 'track_2_pusher'];

async function getFieldByMachine(dateRange, field) {
  const { start, end } = dateRange;
  const spreadQuery = getSpreadQuery(start, end, field);

  return new Promise((resolve, reject) => {
    const result = {};

    queryApi.queryRows(spreadQuery, {
      next(row, tableMeta) {
        const { machine, _value } = tableMeta.toObject(row);
        result[machine] = { [field]: _value };
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}

async function getAllFieldsByMachine(dateRange) {
  return Promise.all(map(fields, (field) => getFieldByMachine(dateRange, field))).then((promises) =>
    reduce(promises, (acc, machines) => merge(acc, machines), {})
  );
}

module.exports = {
  getFieldByMachine,
  getAllFieldsByMachine,
};
