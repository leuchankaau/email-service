import lambda from '../emailSendRouter';
import util from '../util';
describe(`Service emailSendRouter: Test Email send route`, () => {
  afterEach(() => {
    delete process.env.QUEUE_URL_MAILGUN;
    delete process.env.QUEUE_URL_SENDGRID;
    delete process.env.SENDGRID_PROBABILITY;
  });

  test(`Test that SENDGRID_PROBABILITY 1 always return SENDGRID`, () => {
    process.env.QUEUE_URL_MAILGUN = 'url=QUEUE_URL_MAILGUN';
    process.env.QUEUE_URL_SENDGRID = 'url=QUEUE_URL_SENDGRID';
    process.env.SENDGRID_PROBABILITY = '1';
    const event = {};

    const result = lambda.getQueue(event);

    expect(result).toBe(process.env.QUEUE_URL_SENDGRID);
    expect(event.provider).toBe(util.SENDGRID);
  });
  test(`Test that SENDGRID_PROBABILITY 0 always return MAILGUN`, () => {
    process.env.QUEUE_URL_MAILGUN = 'url=QUEUE_URL_MAILGUN';
    process.env.QUEUE_URL_SENDGRID = 'url=QUEUE_URL_SENDGRID';
    process.env.SENDGRID_PROBABILITY = '0';
    const event = {};
    const result = lambda.getQueue(event);
    expect(result).toBe(process.env.QUEUE_URL_MAILGUN);
    expect(event.provider).toBe(util.MAILGUN);
  });
  test(`Test that Send Message called and message initialized`, () => {
    process.env.QUEUE_URL_MAILGUN = 'url=QUEUE_URL_MAILGUN';
    process.env.QUEUE_URL_SENDGRID = 'url=QUEUE_URL_SENDGRID';
    process.env.SENDGRID_PROBABILITY = '1';
    const event = {};
    const context = {awsRequestId:'id=awsRequestId'};
    const sendMessageMock = jest.fn();
    lambda.processEvent(event,context,sendMessageMock);
    expect(sendMessageMock.mock.calls.length).toBe(1);
    expect(event.statusCode).toBe(200);
    expect(event.uuid).toBe(context.awsRequestId);
  });
});