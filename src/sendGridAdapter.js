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
    buildPayload: buildPayload,
    handleErrorResponse:handleErrorResponse
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

    //in retrospective it can be extracted
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            processResponse(res, event, saveItemDBFn);
            resolve('done');
        });
        req.on('error', (e) => {
            console.log('error:', e);
            reject(e.message);
        });
        // send the request
        req.write(body);
        req.end();
    });

};

function processResponse(res, event, saveItemDBFn) {
    console.log('res statusCode:', res.statusCode);
    if (res.statusCode < 200 || res.statusCode > 299) {
        //process error response
        res.on('data', (resData) => {
            handleErrorResponse(res, event, saveItemDBFn, resData);
        });
    } else {
        //process successful call
        event.statusCode = res.statusCode;
        event.state = util.SUCCESS;
        saveItemDBFn(event);
    }
}

function handleErrorResponse(res, event, saveItemDBFn, resData) {
    console.log('resData: ' + resData);
    console.log('statusCode: ' + res.statusCode);
    event.errors = JSON.parse(resData);
    event.statusCode = res.statusCode;
    if (res.statusCode > 399 && res.statusCode < 500) { //if Bad Request save it to Dynamo DB
        event.state = util.BAD_REQUEST;
        saveItemDBFn(event);
    } else {
        event.state = util.FAILED;
        saveItemDBFn(event);
        throw resData; //return message to queue and retry
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
    buildEmailArray(event.to, toArray);
    const ccArray = [];
    buildEmailArray(event.cc, ccArray);
    const bccArray = [];
    buildEmailArray(event.bcc, bccArray);
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

function buildEmailArray(inputArray, resultArray) {
    if (inputArray) {
        for (const email of inputArray) {
            resultArray.push({
                "email": email
            });
        }
    }
}
