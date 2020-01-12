import lambda from '../mailGunAdapter';
import util from '../util';

const https = require('https');
jest.mock('https');
describe(`Service mailGunAdapter: Test Object building and valid error handling`, () => {
    afterEach(() => {
        delete process.env.MAILGUN_API_KEY;
    });

    test(`Test that auth header is properly set and request is started`, () => {
        process.env.MAILGUN_API_KEY = 'api=MAILGUN_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };

        const saveItemDBMock = jest.fn();
        const result = lambda.processMessage(event, saveItemDBMock);
        expect(https.request.mock.calls.length).toBe(1);
         });
    test(`Test that message body to properly converted to MAILGUN format`, () => {
        process.env.MAILGUN_API_KEY = 'api=MAILGUN_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const payload ={
            "bcc": "your@email.com,your@email.com",
            "cc": "your@email.com,your@email.com",
            "from": "your@email.com",
            "subject": "Subject!",
            "text": "Body!",
            "to": "your@email.com,your@email.com"
        };

        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });

    test(`Test that message body to properly converted to without cc and bcc MAILGUN format`, () => {
        process.env.MAILGUN_API_KEY = 'api=MAILGUN_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };

        const payload ={
            "from": "your@email.com",
            "subject": "Subject!",
            "text": "Body!",
            "to": "your@email.com,your@email.com"
        };

        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });
    test(`Test that message body to properly converted cc without to and bcc MAILGUN format`, () => {
        process.env.MAILGUN_API_KEY = 'api=MAILGUN_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            cc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };

        const payload ={
            "from": "your@email.com",
            "subject": "Subject!",
            "text": "Body!",
            "cc": "your@email.com,your@email.com"
        };


        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });
    test(`Test that message body to properly converted from, subject and body MAILGUN format`, () => {
        process.env.MAILGUN_API_KEY = 'api=MAILGUN_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            subject: "Subject!",
            body: "Body!"
        };
        const payload = {
            "from": "your@email.com",
            "subject": "Subject!",
            "text": "Body!"
        };
        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });
    test(`Test that processResponse handles 200`, () => {
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const resp = {
            statusCode: 200
        };
        const saveItemDBMock = jest.fn();
        const result = lambda.processResponse(resp, event, saveItemDBMock);
        expect(saveItemDBMock.mock.calls.length).toBe(1);
        expect(event.statusCode).toBe(200);
        expect(event.state).toBe(util.SUCCESS);
    });
    test(`Test that processResponse handles 400`, () => {
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };

        const respOnMock = jest.fn();
        const resp = {
            statusCode: 400,
            on: respOnMock
        };
        const saveItemDBMock = jest.fn();
        const result = lambda.processResponse(resp, event, saveItemDBMock);
        expect(respOnMock.mock.calls.length).toBe(1);
    });
    test(`Test that handleErrorResponse handles 400`, () => {
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const resp = {
            statusCode: 400
        };
        const respData = '{"error": "test"}';
        const saveItemDBMock = jest.fn();
        const result = lambda.handleErrorResponse(resp, event, saveItemDBMock, respData);
        expect(saveItemDBMock.mock.calls.length).toBe(1);
        expect(event.statusCode).toBe(resp.statusCode);
        expect(event.state).toBe(util.BAD_REQUEST);
    });
    test(`Test that handleErrorResponse handles 500`, () => {
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const resp = {
            statusCode: 500
        };
        const respData = '{"error": "test"}';
        const saveItemDBMock = jest.fn();
        try {
            lambda.handleErrorResponse(resp, event, saveItemDBMock, respData);
        } catch (e) {
            expect(e).toBe(respData);
        }
        expect(saveItemDBMock.mock.calls.length).toBe(1);
        expect(event.statusCode).toBe(resp.statusCode);
        expect(event.state).toBe(util.FAILED);
    });
});