const https = require('https');
const querystring = require('querystring');
const util = require('./util');

module.exports = {
    handler: (records) => {
        for (const message of records.Records) {
            processMessage(JSON.parse(message.body), util.saveItemDB);
        }
    },
    processMessage: processMessage,
    processResponse: processResponse,
    buildPayload: buildPayload,
    handleErrorResponse: handleErrorResponse
};

function processMessage(event, saveItemDBFn) {
    const form = buildPayload(event);

    const body = querystring.stringify(form);
    const contentLength = body.length;

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

    console.log('formData:', body);
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            processResponse(res, event, saveItemDBFn);
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
        res.on('data', (resData) => {
            handleErrorResponse(res, event, saveItemDBFn, resData);
        });
    } else {
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

    let payload = {
        from: event.from,
        subject: event.subject,
        text: event.body
    };
    if (event.to && event.to.length) {
        payload.to = event.to.join();
    }
    if (event.cc && event.cc.length) {
        payload.cc = event.cc.join();
    }

    if (event.bcc && event.bcc.length) {
        payload.bcc = event.bcc.join();
    }
    return payload;
}

function make_base_auth(apikey) {
    const tok = 'api:' + apikey;
    const hash = Buffer.from(tok).toString('base64');
    return "Basic " + hash;
}