const https = require('https');
const AWS = require('aws-sdk');   // eslint-disable-line import/no-extraneous-dependencies, import/no-unresolved

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

function promisify(func) {
  return (...args) =>
    new Promise((resolve, reject) =>
      func(...args, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    );
}

function fetchJson(options) {
  return new Promise((resolve, reject) => {
    let str = '';
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        str += chunk;
      });
      res.on('end', () => {
        try {
          const content = JSON.parse(str);
          resolve(content);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('end', (err) => {
      reject(err);
    });
    req.end();
  });
}

function promiseObjectJoin(tasks) {
  const keys = Object.keys(tasks);
  const taskArray = keys.map(key => tasks[key]);
  return Promise.all(taskArray)
    .then((results) => {
      const obj = {};
      keys.forEach((key, i) => { obj[key] = results[i]; });
      return obj;
    });
}

function getProgress(content) {
  if (!content.aggregate_progress) {
    throw new Error(`Invalid result: ${JSON.stringify(content)}`);
  }
  return content.aggregate_progress;
}

const teams = [
  'blsm', 'ce', 'dig', 'eid', 'estar',
  'exp', 'fnc', 'gfe', 'kt', 'ldy',
  'lfive', 'mty', 'mvpb', 'mvpm', 'nav',
  'nt', 'pd', 'roll', 'rpg', 'rrr',
  'rvn', 'soa', 'spt', 'sss', 'tf',
  'tgg', 'tl', 'tmp', 'trk', 'ts',
  'wkg', 'zlt'
];

exports.handler = (event, context, callback) => {
  const tasks = {};
  tasks.progression = fetchJson({
    host: 'api.twitch.tv',
    path: `/kraken/esports/tournaments/hgc_2017/bits/progress?client_id=${process.env.TWITCH_CLIENT_ID}`,
    headers: {
      'Accept': 'application/vnd.twitchtv.v5+json'
    }
  }).then(getProgress);
  teams.forEach((team) => {
    tasks[team] = fetchJson({
      host: 'api.twitch.tv',
      path: `/kraken/esports/tournaments/hgc_2017/bits/teams/${team}/progress?client_id=${process.env.TWITCH_CLIENT_ID}`,
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json'
      }
    }).then(getProgress);
  });
  promiseObjectJoin(tasks).then((content) => {
    const time = Date.now();
    return Object.assign({
      time,
      date: Math.floor(time / 1000 / 3600 / 24)
    }, content);
  }).then((result) =>
      promisify(dynamodb.put.bind(dynamodb))({
        'TableName': 'blizzard-bits-progression1',
        'Item': result
      }).then(() => result)
    )
    .then((data) => callback(null, data))
    .catch((err) => callback(err));
};
