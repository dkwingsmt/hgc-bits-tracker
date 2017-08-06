const _ = require('lodash');
const Papa = require('papaparse');
const bs = require('binarysearch');

function readFromPipe() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });

    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function pickRows(table, maxRows) {
  const timeIndex = table[0].findIndex(a => a === 'time');
  const body = table.slice(2)     // Not counting header row and dummy row
    .sort((a, b) => a[timeIndex] - b[timeIndex]);
  const bodyLength = body.length;
  if (bodyLength <= maxRows) {
    return [table[0]].concat(body);
  }
  const times = _.map(body, timeIndex);
  const startTime = times[0];
  const lastTime = times[bodyLength - 1];
  // Find the closest time of each time
  const stepTime = (lastTime - startTime) / (maxRows - 1);
  const resultTable = [table[0]];
  let nowRow = 0;
  let nowTime = parseInt(startTime, 10);
  for (let i = 0; i < maxRows; i += 1) {
    const closestRow = bs.closest(times, nowTime);
    nowRow = _.clamp(closestRow, nowRow + 1, bodyLength - maxRows + i);
    nowTime += stepTime;
    resultTable.push(body[nowRow].map(number => parseInt(number, 10)));
  }
  return resultTable;
}

readFromPipe()
  .then((tableStr) => {
    const { data, errors } = Papa.parse(tableStr);
    if (errors.length) {
      throw errors;
    }
    return data;
  })
  .then(table => pickRows(table, 100))
  .then(JSON.stringify)
  .then(console.log);   // eslint-disable-line no-console
