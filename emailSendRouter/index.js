var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-2'});
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context) {

  var queue_url = getQueue();
  console.log('USE queue_url:',queue_url);
  event.uuid = uuidv4() ;
  event.state = 'ACCEPTED';
  console.log('Generated uuid for event:',event.uuid);
  console.log('event:',JSON.stringify(event));
  sendMessage(event,queue_url,context);
}
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function getQueue(){
  var QUEUE_URL_SENDGRID = process.env.QUEUE_URL_SENDGRID;
  console.log('QUEUE_URL_SENDGRID:',QUEUE_URL_SENDGRID);
  var QUEUE_URL_MAILGUN = process.env.QUEUE_URL_MAILGUN;
  console.log('QUEUE_URL_MAILGUN:',QUEUE_URL_MAILGUN);
  var SENDGRID_PROBABILITY = process.env.SENDGRID_PROBABILITY;

  console.log('SENDGRID_PROBABILITY:',SENDGRID_PROBABILITY);
  if(SENDGRID_PROBABILITY-Math.random()>0 ||SENDGRID_PROBABILITY==1){
      console.log('USE QUEUE_URL_SENDGRID:',QUEUE_URL_SENDGRID);
      return QUEUE_URL_SENDGRID;
  } else {
          console.log('USE QUEUE_URL_MAILGUN:',QUEUE_URL_MAILGUN);
     return QUEUE_URL_MAILGUN;
  }

}
function sendMessage(event,queue_url, context){
    var params = {
    MessageBody: JSON.stringify(event),
    MessageGroupId:  event.uuid,
    MessageDeduplicationId: event.uuid,
    QueueUrl: queue_url
  };
  sqs.sendMessage(params, function(err,data){
    if(err) {
      console.log('error:',"Fail Send Message" + err);
      context.done('error', "ERROR Put SQS");  // ERROR with message
    }else{
      console.log('data:',data.MessageId);
      saveItem(event);
      context.done(null,'');  // SUCCESS
    }
  });
}
function saveItem(event) {
  return new Promise(resolve => {
    var params = {
            TableName: 'emails',
            Item: {
                'uuid': event.uuid,
                'statusCode': event.statusCode,
                'state': event.state,
                'errors': event.errors,
                'event': JSON.stringify(event)
            }
        };

        ddb.put(params, function(err, data) {

            if (err) {
                console.log(err);
                return err;
            }
            else {
               return data;
            }
        });
  });
}
