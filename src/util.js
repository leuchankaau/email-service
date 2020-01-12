const BAD_REQUEST = 'BAD_REQUEST'; //Returns in case if provider didn't accept message.
const ACCEPTED = 'ACCEPTED';//Returns when service started processing of request.
const FAILED = 'FAILED';//Returns when service failed to process request.
const SUCCESS = 'SUCCESS';//Returns when service accepted message.
const SENDGRID = 'SENDGRID';
const MAILGUN = 'MAILGUN';
const TABLE_NAME = 'emails';

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();


function saveItemDB(event) {
    console.log('event:', event);
    const params = {
        TableName: TABLE_NAME,
        Item: {
            'uuid': event.uuid,
            'statusCode': event.statusCode,
            'state': event.state,
            'retryCount': event.retryCount,
            'provider': event.provider,
            'errors': event.errors,
            'event': event
        }
    };
    console.log('params:', params);
    ddb.put(params, function (err, data) {
        if (err) {
            console.log('error:', err);
        } else {
            console.log('data:', data);
        }
    });
    console.log('DB saved');
}

function sendMessage(event, queue_url, context) {
    const params = {
        MessageBody: JSON.stringify(event),
        MessageGroupId: event.uuid,
        MessageDeduplicationId: event.uuid,
        QueueUrl: queue_url
    };
    saveItemDB(event);
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log('error:', "Fail Send Message" + err);
            context.done('error', "ERROR Put SQS"); // ERROR with message
        } else {
            console.log('data:', data.MessageId);
            context.done(null, {uuid: event.uuid, provider: event.provider, state: event.state}); // SUCCESS
        }
    });
}

module.exports = {
    ACCEPTED: ACCEPTED,
    FAILED: FAILED,
    BAD_REQUEST: BAD_REQUEST,
    SUCCESS: SUCCESS,
    SENDGRID: SENDGRID,
    MAILGUN: MAILGUN,
    saveItemDB: saveItemDB,
    sendMessage: sendMessage
};