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

    const saveItemDBMock = jest.fn();
    const result = lambda.buildPayload(event);
    console.log( result);
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

    const saveItemDBMock = jest.fn();
    const result = lambda.buildPayload(event);
    console.log( result);
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

    const saveItemDBMock = jest.fn();
    const result = lambda.buildPayload(event);
    console.log( result);
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
        {
        }
      ],
      "subject": "Subject!"
    };

    const saveItemDBMock = jest.fn();
    const result = lambda.buildPayload(event);
    console.log( result);
    expect(result).toEqual(payload);
  });
})
;