const util = require('./util');
const https = require('https');

exports.handler = async (records) => {
  const mes = JSON.stringify(records);
  for (const message of records.Records) {
  return processMessage(JSON.parse(message.body));
  }
};

function processMessage(event) {
  const auth = 'Bearer ' + process.env.SENDGRID_API_KEY;
  const msg = buildPayload(event);
  const body = JSON.stringify(msg);
  console.log('body:', body);
  return new Promise((resolve, reject) => {
    const options = {
      host: 'api.sendgrid.com',
      path: '/v3/mail/send',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'Authorization': auth
      }
    };
    const req = https.request(options, (res) => {
      console.log('res statusCode:', res.statusCode);
      if (res.statusCode < 200 || res.statusCode > 299) {
        res.on('data', function (errorData) {
          console.log('errorData: ' + errorData);
          if (res.statusCode == 400) { //if Bad Request save it to Dynamo DB
            event.error = JSON.parse(errorData);
            event.state = util.BAD_REQUEST;
            event.statusCode = res.statusCode;
            util.saveItemDB(event);
            resolve('Success');
          }
          else {
            reject(errorData);
          }
        });
      }
      else {
        event.state = util.SUCCESS;
        util.saveItemDB(event);
        resolve('Success');
      }
    });
    req.on('error', (e) => {
      console.log('error:', e);
      reject(e.message);
    });
    // send the request
    req.write(body);
    req.end();
  });
}

function buildPayload(event) {
  const toArray = [];
  buildEmaillArray(event.to, toArray);
  const ccArray = [];
  buildEmaillArray(event.cc, ccArray);
  const bccArray = [];
  buildEmaillArray(event.bcc, bccArray);
  const msg = {
    "personalizations": [{
      "to": toArray
    }],
    "from": {
      "email": event.from
    },
    "subject": event.subject,
    "content": [{
      "type": "text/plain",
      "value": event.body
    }]
  };
  return msg;
}

function buildEmaillArray(inputArray, resultArray) {
  if(inputArray){
  for (const email of inputArray) {
    resultArray.push({
      "email": email
    });
  }}
}
