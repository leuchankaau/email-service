const util = require('./util');
const https = require('https');

exports.handler = async (records) => {
    for (const message of records.Records) {
        await processMessage(JSON.parse(message.body));
    }
};

function processMessage(event) {
    const auth = 'Bearer ' + process.env.SENDGRID_API_KEY;
    const msg = buildPayload(event);
    const body = JSON.stringify(msg);
    console.log('body:', body);
    return new Promise((resolve, reject) => {
        const options = {
            host: 'api.sendgrid.com',
            path: '/v3/mail/send',
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length,
                'Authorization': auth
            }
        };
        const req = https.request(options, (res) => {
            console.log('res statusCode:', res.statusCode);
            if (res.statusCode < 200 || res.statusCode > 299) {
                res.on('data', function (resData) {
                    console.log('resData: ' + resData);
                    if (res.statusCode == 400) { //if Bad Request save it to Dynamo DB
                        event.errors = JSON.parse(resData);
                        event.state = util.BAD_REQUEST;
                        event.statusCode = res.statusCode;
                        util.saveItemDB(event);
                    } else {
                        event.state = util.BAD_REQUEST;
                        event.statusCode = res.statusCode;
                        util.saveItemDB(event);
                        reject(resData);
                    }
                });
            } else {
                event.state = util.SUCCESS;
                util.saveItemDB(event);
            }
        });
        req.on('error', (e) => {
            console.log('error:', e);
            reject(e.message);
        });
        // send the request
        req.write(body);
        req.end();
    });
}

function buildPayload(event) {
    const toArray = [];
    buildEmaillArray(event.to, toArray);
    const ccArray = [];
    buildEmaillArray(event.cc, ccArray);
    const bccArray = [];
    buildEmaillArray(event.bcc, bccArray);
    return {
        "personalizations": [{
            "to": toArray
        }],
        "from": {
            "email": event.from
        },
        "subject": event.subject,
        "content": [{
            "type": "text/plain",
            "value": event.body
        }]
    };
}

function buildEmaillArray(inputArray, resultArray) {
    if (inputArray) {
        for (const email of inputArray) {
            resultArray.push({
                "email": email
            });
        }
    }
}
