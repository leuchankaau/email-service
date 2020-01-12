'use strict';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'emails';

module.exports = {
    handler: function (event, context, callback) {
        processRequest(event, context, callback, docClient.get);
    },
    processRequest: processRequest,
    processResponse: processResponse
};

function processRequest(event, context, callback, getFn) {
    //event.queryStringParameters.uuid injected by lambda proxy, uuid of message that need to be retrieved.
    console.log("event.queryStringParameters.uuid", event.queryStringParameters.uuid);
    const params = {
        TableName: TABLE_NAME,
        Key: {
            "uuid": event.queryStringParameters.uuid
        }
    };
    // Call DynamoDB to read the item from the table
    getFn(params, (err, data) => {
        processResponse(err, data, callback)
    });
}

function processResponse(err, data, callback) {
    if (err) {
        //Process error
        console.log("err", err);
        const response = {
            "statusCode": 500,
            "body": JSON.stringify(err),
            "isBase64Encoded": false
        };
        //Return response to API gateway
        callback(response, null);
    } else if (data.Item) {
        //Process retrieved item
        console.log("data", data);
        //Return response to API gateway
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
        //Process Not found
        const response = {
            "statusCode": 404,
            "body": '',
            "isBase64Encoded": false
        };
        callback(null, response);
    }
}