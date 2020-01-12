import lambda from '../sendGridAdapter';
import util from '../util';

describe(`Integration test for sendGridAdapter, skipped test requires manual injection of a key:`, () => {
    afterEach(() => {
        delete process.env.SENDGRID_API_KEY;
    });

    test.skip(`Test successful call`, () => {
        //Key in repo is always a bad idea and SendGrid scans git repo open key
        process.env.SENDGRID_API_KEY = 'YOUR_KEY';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your1@email.com", "your2@email.com"],
            cc: ["your3@email.com", "your4@email.com"],
            bcc: ["your5@email.com", "your6@email.com"],
            subject: "Subject!",
            body: "Body!"
        };

        const saveItemDBMock = jest.fn();
        const result = lambda.processMessage(event, saveItemDBMock);
        return result.then(() => {
            console.log('Result event:' + event)
            expect(event.statusCode).toBe(202);
            expect(event.state).toBe(util.SUCCESS);
        })

    });

    test(`Test 401 UNAUTHORIZED call`, () => {
        process.env.SENDGRID_API_KEY = 'Incorrect key';
        const event = {
            uuid: 'eventuuid',
            from: "your@email.com",
            to: ["your1@email.com", "your2@email.com"],
            cc: ["your3@email.com", "your4@email.com"],
            bcc: ["your5@email.com", "your6@email.com"],
            subject: "Subject!",
            body: "Body!"
        };

        const saveItemDBMock = jest.fn();
        const result = lambda.processMessage(event, saveItemDBMock);
        return result.then(() => {
            console.log('Result event:' + event)
            expect(event.statusCode).toBe(401);
            expect(event.state).toBe(util.BAD_REQUEST);
        })

    });
});