import lambda from '../emailStatus';

describe(`Service emailStatus: Test Object retrieval`, () => {
    test(`Test processRequest that service get header and get from DB started`, () => {
        const event = {queryStringParameters: {uuid: 'eventuuid'}};
        const contextMock = jest.fn();
        const callbackMock = jest.fn();
        const getMock = jest.fn();
        const result = lambda.processRequest(event, contextMock, callbackMock, getMock);
        expect(getMock.mock.calls.length).toBe(1);
        expect(getMock.mock.calls[0][0].Key).toEqual({"uuid": event.queryStringParameters.uuid});
    });

    test(`Test processResponse that process db response`, () => {
        const error = undefined;
        const data = {
            Item: {
                uuid: 'eventuuid',
                provider: 'provider',
                statusCode: 'statusCode',
                state: 'state',
                errors: ['state']
            }};
        const callbackMock = jest.fn();
        const result = lambda.processResponse(error, data, callbackMock);
        expect(callbackMock.mock.calls.length).toBe(1);
        expect(callbackMock.mock.calls[0][1]).toEqual({
            "statusCode": 200,
            "body": JSON.stringify({
                uuid: data.Item.uuid, provider: data.Item.provider, statusCode: data.Item.statusCode,
                state: data.Item.state,
                errors: data.Item.errors
            }),
            "isBase64Encoded": false
        });
    });
    test(`Test processResponse that process db error`, () => {
        const error = {message:"error"};
        const data = {
            Item: {
                uuid: 'eventuuid',
                provider: 'provider',
                statusCode: 'statusCode',
                state: 'state',
                errors: ['state']
            }};
        const callbackMock = jest.fn();
        const result = lambda.processResponse(error, data, callbackMock);
        expect(callbackMock.mock.calls.length).toBe(1);
        expect(callbackMock.mock.calls[0][0]).toEqual({
            "statusCode": 500,
            "body": JSON.stringify(error),
            "isBase64Encoded": false
        });
    });

    test(`Test processResponse that process db not found`, () => {
        const error = undefined;
        const data = {};
        const callbackMock = jest.fn();
        const result = lambda.processResponse(error, data, callbackMock);
        expect(callbackMock.mock.calls.length).toBe(1);
        expect(callbackMock.mock.calls[0][1]).toEqual({
            "statusCode": 404,
            "body": '',
            "isBase64Encoded": false
        });
    });
});