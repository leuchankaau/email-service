import lambda from '../sendGridAdapter';
import util from '../util';

const https = require('https');
jest.mock('https');
describe(`Service sendGridAdapter: Test Object building and valid error handling`, () => {
    afterEach(() => {
        delete process.env.SENDGRID_API_KEY;
    });

    test(`Test that auth header is properly set and request is started`, () => {
        process.env.SENDGRID_API_KEY = 'api=SENDGRID_API_KEY';
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
        expect(https.request.mock.calls[0][0].headers.Authorization).toBe('Bearer ' + process.env.SENDGRID_API_KEY);
    });
    test(`Test that message body to properly converted to SENDGRID format`, () => {
        process.env.SENDGRID_API_KEY = 'api=SENDGRID_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            cc: ["your@email.com", "your@email.com"],
            bcc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const payload = {
            "content": [
                {
                    "type": "text/plain",
                    "value": "Body!"
                }
            ],
            "from": {
                "email": "your@email.com"
            },
            "personalizations": [
                {
                    "bcc": [
                        {
                            "email": "your@email.com"
                        },
                        {
                            "email": "your@email.com"
                        }
                    ],
                    "cc": [
                        {
                            "email": "your@email.com"
                        },
                        {
                            "email": "your@email.com"
                        }
                    ],
                    "to": [
                        {
                            "email": "your@email.com"
                        },
                        {
                            "email": "your@email.com"
                        }
                    ]
                }
            ],
            "subject": "Subject!"
        };

        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });

    test(`Test that message body to properly converted to without cc and bcc SENDGRID format`, () => {
        process.env.SENDGRID_API_KEY = 'api=SENDGRID_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const payload = {
            "content": [
                {
                    "type": "text/plain",
                    "value": "Body!"
                }
            ],
            "from": {
                "email": "your@email.com"
            },
            "personalizations": [
                {
                    "to": [
                        {
                            "email": "your@email.com"
                        },
                        {
                            "email": "your@email.com"
                        }
                    ]
                }
            ],
            "subject": "Subject!"
        };

        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });
    test(`Test that message body to properly converted cc without to and bcc SENDGRID format`, () => {
        process.env.SENDGRID_API_KEY = 'api=SENDGRID_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            cc: ["your@email.com", "your@email.com"],
            subject: "Subject!",
            body: "Body!"
        };
        const payload = {
            "content": [
                {
                    "type": "text/plain",
                    "value": "Body!"
                }
            ],
            "from": {
                "email": "your@email.com"
            },
            "personalizations": [
                {
                    "cc": [
                        {
                            "email": "your@email.com"
                        },
                        {
                            "email": "your@email.com"
                        }
                    ]
                }
            ],
            "subject": "Subject!"
        };

        const result = lambda.buildPayload(event);
        console.log(result);
        expect(result).toEqual(payload);
    });
    test(`Test that message body to properly converted from, subject and body SENDGRID format`, () => {
        process.env.SENDGRID_API_KEY = 'api=SENDGRID_API_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            subject: "Subject!",
            body: "Body!"
        };
        const payload = {
            "content": [
                {
                    "type": "text/plain",
                    "value": "Body!"
                }
            ],
            "from": {
                "email": "your@email.com"
            },
            "personalizations": [
                {}
            ],
            "subject": "Subject!"
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