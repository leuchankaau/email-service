const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'emails';

exports.handler = function (event, context, callback) {
    console.log("event", event);
    console.log("event.queryStringParameters.uuid", event.queryStringParameters.uuid);
    const params = {
        TableName: TABLE_NAME,
        Key: {
            "uuid": event.queryStringParameters.uuid
        }
    };


    console.log("Call DynamoDB.");
// Call DynamoDB to read the item from the table
    docClient.get(params, function (err, data) {
        if (err) {
            console.log("err", err);
            const response = {
                "statusCode": 500,
                "body": JSON.stringify(err),
                "isBase64Encoded": false
            };
            callback(response, null);
        } else if (data.Item) {
            console.log("data", data);

            const response = {
                "statusCode": 200,
                "body": JSON.stringify({
                    uuid: data.Item.uuid, provider: data.Item.provider, statusCode: data.Item.statusCode,
                    state: data.Item.state,
                    errors: data.Item.errors
                }),
                "isBase64Encoded": false
            };
            callback(null, response);
        } else {
            const response = {
                "statusCode": 404,
                "body": '',
                "isBase64Encoded": false
            };
            callback(null, response);
        }
    });

};