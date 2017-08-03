const Papa = require('papaparse');

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
    .sort((a, b) => b[timeIndex] - a[timeIndex]);
  const bodyLength = body.length;
  if (bodyLength <= maxRows) {
    return table;
  }
  const step = Math.floor(bodyLength / maxRows);
  const initRow = bodyLength - step * (maxRows - 1) - 1;
  const resultTable = [table[0]];
  for (let i = initRow; i < table.length; i += step) {
    resultTable.push(body[i].map(number => parseInt(number, 10)));
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
  .then(console.log);
