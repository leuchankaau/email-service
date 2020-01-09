const BAD_REQUEST = 'BAD_REQUEST';
const ACCEPTED = 'ACCEPTED';
const FAILED = 'FAILED';
const SUCCESS = 'SUCCESS';
const SENDGRID = 'SENDGRID';
const MAILGUN = 'MAILGUN';
const TABLE_NAME = 'emails';

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();


function saveItemDB(event) {
    return new Promise(resolve => {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                'uuid': event.uuid,
                'statusCode': event.statusCode,
                'state': event.state,
                'retryCount': event.retryCount,
                'provider': event.provider,
                'errors': event.errors,
                'event': JSON.stringify(event)
            }
        };

        ddb.put(params, function (err, data) {

            if (err) {
                console.log(err);
                return err;
            } else {
                return data;
            }
        });
    });
}

function sendMessage(event, queue_url, context) {
    const response = {uuid:event.uuid};
    const params = {
        MessageBody: JSON.stringify(event),
        MessageGroupId: event.uuid,
        MessageDeduplicationId: event.uuid,
        QueueUrl: queue_url
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log('error:', "Fail Send Message" + err);
            context.done('error', "ERROR Put SQS"); // ERROR with message
        } else {
            console.log('data:', data.MessageId);
            saveItemDB(event);
            context.done(null, {uuid: event.uuid,provider:event.provider,state:event.state}); // SUCCESS
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