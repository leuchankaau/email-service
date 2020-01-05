var https = require('https');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    var auth = 'Bearer '+process.env.SENDGRID_API_KEY;
    var toArray =[];
    for (const to of event.to){
      toArray.push({"email":to });
    }
     var msg = {"personalizations": [
         {"to":toArray}],
         "from": { "email": event.from},
         "subject": event.subject,
         "content": [{"type": "text/plain", "value": event.body}]};
const body = JSON.stringify(msg);
console.log('body:',body);
return new Promise((resolve, reject) => {
        const options = {
            host: 'api.sendgrid.com',
            path: '/v3/mail/send',
            port: 443,
            method: 'POST',
              headers : {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      'Authorization': auth
   }
        };
          const req = https.request(options, (res) => {
          console.log('res statusCode:', res.statusCode);
              if(res.statusCode < 200 || res.statusCode > 299){
                 res.on('data', function (errorData) {
                      console.log('errorData: ' + errorData);
                 if (res.statusCode == 400){//if Bad Request save it to Dynamo DB
                      event.error = JSON.parse(errorData);
                      event.state = 'BAD_REQUEST';
                      event.statusCode = res.statusCode;
                      saveItem(event);
                      resolve('Success');
                 } else {
                      reject(errorData);
                 }
                 });
              } else {
                  resolve('Success');
              }
        });

        req.on('error', (e) => {
          console.log('error:',e);
          reject(e.message);
        });

        // send the request
        req.write(body);
        req.end();
    });

};
function saveItem(event) {
  return new Promise(resolve => {
    var params = {
            TableName: 'emails',
            Item: {
                'uuid': event.uuid,
                'statusCode': event.statusCode,
                'error': JSON.stringify(event.error),
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
