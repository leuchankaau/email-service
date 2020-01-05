var https = require('https');
var querystring = require('querystring');
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    var form = {
    from:event.from,
    to: event.to.join(),
    cc: event.cc.join(),
    bcc: event.bcc.join(),
    subject: event.subject,
    text: event.body
};

var formData = querystring.stringify(form);
var contentLength = formData.length;

console.log('formData:', formData);
return new Promise((resolve, reject) => {
        const options = {
            host: 'api.mailgun.net',
            path: '/v3/sandboxddf393cff207464c850bf749f0f60432.mailgun.org/messages',
            port: 443,
            method: 'POST',
            headers : {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': make_base_auth(process.env.MAILGUN_API_KEY)
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

        req.write(formData);
        req.end();
    });

};
function make_base_auth( apikey) {
  var tok = 'api:' + apikey;
  var hash = Buffer.from(tok).toString('base64');
  return "Basic " + hash;
}
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
