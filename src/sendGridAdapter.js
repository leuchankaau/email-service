'use strict';
const util = require('./util');
const https = require('https');

module.exports = {
    handler: (records) => {
        for (const message of records.Records) {
            processMessage(JSON.parse(message.body), util.saveItemDB);
        }
    },
    processMessage: processMessage,
    processResponse: processResponse,
    buildPayload: buildPayload
};

function processMessage(event, saveItemDBFn) {
    const auth = 'Bearer ' + process.env.SENDGRID_API_KEY;
    const msg = buildPayload(event);
    const body = JSON.stringify(msg);
    console.log('body:', body);

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

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            const responseResult = processResponse(res, event, saveItemDBFn);
            console.log('Response result :', responseResult);
            if (responseResult && responseResult.reject) reject(responseResult.reject);
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

function processResponse(res, event, saveItemDBFn) {
    console.log('res statusCode:', res.statusCode);
    if (res.statusCode < 200 || res.statusCode > 299) {
        res.on('data', function (resData) {
            console.log('resData: ' + resData);
            console.log('statusCode: ' + res.statusCode);
            if (res.statusCode == 400) { //if Bad Request save it to Dynamo DB
                event.errors = JSON.parse(resData);
                event.state = util.BAD_REQUEST;
                event.statusCode = res.statusCode;
                saveItemDBFn(event);
                return {};
            } else {
                event.state = util.BAD_REQUEST;
                event.statusCode = res.statusCode;
                saveItemDBFn(event);
                return {reject: resData};
            }
        });
    } else {
        event.state = util.SUCCESS;
        saveItemDBFn(event);
        return {};
    }
}

function buildPayload(event) {
    const result = {
        from: {
            email: event.from
        },
        subject: event.subject,
        content: [{
            type: "text/plain",
            value: event.body
        }]
    };


    const toArray = [];
    buildEmaillArray(event.to, toArray);
    const ccArray = [];
    buildEmaillArray(event.cc, ccArray);
    const bccArray = [];
    buildEmaillArray(event.bcc, bccArray);
    const persItem = {};
    if (toArray.length) {
        persItem.to = toArray;
    }
    if (ccArray.length) {
        persItem.cc = ccArray;
    }
    if (bccArray.length) {
        persItem.bcc = bccArray;
    }
    result.personalizations = [persItem];
    return result;
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
