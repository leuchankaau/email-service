import lambda from '../sendGridAdapter';
import util from '../util';

describe(`Integration test for sendGridAdapter:`, () => {
    afterEach(() => {
        delete process.env.SENDGRID_API_KEY;
    });

    test(`Test successful call`, () => {
        process.env.SENDGRID_API_KEY = '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';
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
            expect(event.statusCode).toBe(202);
            expect(event.state).toBe(util.SUCCESS);
        })

    });
});