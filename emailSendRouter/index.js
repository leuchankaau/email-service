const util = require('./util');
exports.handler = function (event, context) {

  var queue_url = getQueue(event);
  console.log('USE queue_url:', queue_url);
  event.uuid = uuidv4();
  event.state = util.ACCEPTED;
  console.log('Generated uuid for event:', event.uuid);
  console.log('event:', JSON.stringify(event));
  util.sendMessage(event, queue_url, context);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getQueue(event) {
  const QUEUE_URL_SENDGRID = process.env.QUEUE_URL_SENDGRID;
  console.log('QUEUE_URL_SENDGRID:', QUEUE_URL_SENDGRID);
  const QUEUE_URL_MAILGUN = process.env.QUEUE_URL_MAILGUN;
  console.log('QUEUE_URL_MAILGUN:', QUEUE_URL_MAILGUN);
  const SENDGRID_PROBABILITY = process.env.SENDGRID_PROBABILITY;
  console.log('SENDGRID_PROBABILITY:', SENDGRID_PROBABILITY);

  if (SENDGRID_PROBABILITY - Math.random() > 0 || SENDGRID_PROBABILITY == 1) {
    console.log('USE QUEUE_URL_SENDGRID:', QUEUE_URL_SENDGRID);
    event.provider = util.SENDGRID;
    return QUEUE_URL_SENDGRID;
  } else {
    console.log('USE QUEUE_URL_MAILGUN:', QUEUE_URL_MAILGUN);
    event.provider = util.MAILGUN;
    return QUEUE_URL_MAILGUN;
  }

}