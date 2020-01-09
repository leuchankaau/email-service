const https = require('https');
const querystring = require('querystring');
const util = require('./util');

exports.handler = async (records) => {
  const mes = JSON.stringify(records);
  for (const message of records.Records) {
  return processMessage(JSON.parse(message.body));
  }
};

  function processMessage(event) {
    const form = buildPayload(event);

    const formData = querystring.stringify(form);
    const contentLength = formData.length;

    console.log('formData:', formData);
    return new Promise((resolve, reject) => {
        const options = {
            host: 'api.mailgun.net',
            path: '/v3/sandboxddf393cff207464c850bf749f0f60432.mailgun.org/messages',
            port: 443,
            method: 'POST',
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': make_base_auth(process.env.MAILGUN_API_KEY)
            }
        };
        const req = https.request(options, (res) => {
            console.log('res statusCode:', res.statusCode);
            if (res.statusCode < 200 || res.statusCode > 299) {
                res.on('data', function (errorData) {
                    console.log('errorData: ' + errorData);
                    if (res.statusCode == 400) { //if Bad Request save it to Dynamo DB
                        event.error = JSON.parse(errorData);
                        event.state = util.BAD_REQUEST;
                        event.statusCode = res.statusCode;
                        util.saveItemDB(event);
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
            console.log('error:', e);
            reject(e.message);
        });

        // send the request

        req.write(formData);
        req.end();
    });

};

function buildPayload(event) {
    var cc;
    if (event.cc) {
        cc = event.cc.join();
    }

    var bcc;
    if (event.bcc) {
         bcc = event.bcc.join();
    }
    return {
        from: event.from,
        to: event.to.join(),
        cc: cc,
        bcc: bcc,
        subject: event.subject,
        text: event.body
    };
}

function make_base_auth(apikey) {
    var tok = 'api:' + apikey;
    var hash = Buffer.from(tok).toString('base64');
    return "Basic " + hash;
}