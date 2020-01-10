const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'emails';

exports.handler = function (event, context, callback) {
  console.log("event", event);
  console.log("event.queryStringParameters.uuid", event.queryStringParameters.uuid);
  var params = {
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
      callback(err, null);
    } else {
      console.log("data", data);
      callback(null, {
        uuid: data.Item.uuid,
        provider: data.Item.provider,
        statusCode: data.Item.statusCode,
        state: data.Item.state,
        errors: data.Item.errors
      });
    }
  });

};
