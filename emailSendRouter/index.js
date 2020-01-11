const util = require('./util');
exports.handler = function (event, context) {

  var queue_url = getQueue(event);
  console.log('USE queue_url:', queue_url);
  event.uuid = context.awsRequestId;
  event.state = util.ACCEPTED;
  event.retryCount = 0;
  event.statusCode = 200;
  event.errors = {};

  console.log('Message uuid for event:', event.uuid);
  console.log('event:', JSON.stringify(event));
  util.sendMessage(event, queue_url, context);
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