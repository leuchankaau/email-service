# Email-service
You can see swagger doc [here](https://app.swaggerhub.com/apis/ToliTest/EmailService/1.0.1) that points to running [API - get example](https://jk8ncbovj6.execute-api.us-east-2.amazonaws.com/test/email?uuid=75fa9038-352d-463a-a053-1d9eca975cff).
Service have 2 methods send email and get email status.
Email service API to provide an abstraction between different email service providers. Service takes managing delivery to a customer responsibility, manages load and fail-over between providers and allows delivery monitoring. Current supported providers Mailgun and SendGrid.  

## Table of contents
  * [Table of contents](#table-of-contents)
  * [Getting Started](#Getting-Started)
  * [Project Structure](#Project-Structure) 
  * [Deployment](#Deployment)  
  * [Testing](#testing)
  * [Error Handling](#error-handling)
  * [Input validation](#input-validation)
  * [Using this service](#using-this-service)
  * [TODO](#TODO)

## Getting Started
Architecture overview can be found [here](https://github.com/leuchankaau/email-service/blob/master/ARCHITECTURE.md)
Project build using AWS Lambda, API Gateway, SQS and DynamoDB.
## Project Structure
1. API definition can be found [here](https://github.com/leuchankaau/email-service/blob/master/api/openapi.yaml). API defines contract with consumer. yaml file used to generate AWS API Gateway.
2. EmailSendRouter lambda that accepts POST email API call, creates message and puts it to one of provider queues.
Decision made randomly based on environment variable. Lambda records messages in DynamoDB.
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/src/emailSendRouter.js). 
Lambda have dependency on util library [here](https://github.com/leuchankaau/email-service/blob/master/src/util.js)
3. SendGridAdapter lambda that get a message from the SendGrid queue, and sends it to SendGrid. 
Lambda records messages with response in DynamoDB. 
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/src/sendGridAdapter.js). 
Lambda have dependency on util library [here](https://github.com/leuchankaau/email-service/blob/master/src/util.js)
4. MailGunAdapter lambda that get a message from the MailGun queue, and sends it to MailGun. 
Lambda records messages with response in DynamoDB. 
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/src/mailGunAdapter.js). 
Lambda have dependency on util library [here](https://github.com/leuchankaau/email-service/blob/master/src/util.js)
5. EmailStatus lambda that  accepts GET email API call, requires a query uuid parameter.
Lambda use uuid parameter to get message status from DynamoDB and prepare it response to developer. 
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/src/emailStatus.js). 
6. Util javascript library with constants and reusable functions. 
Util can be found here [here](https://github.com/leuchankaau/email-service/blob/master/src/util.js). 
## Deployment
Application ideally would have CI/CD pipeline to create required resources, API and deploy lambdas, it was too complex and I added it in TODO. 

Follow manual steps required to deploy application:  
1. Create queues for application: 

DLQsendgrid.fifo and sendgrid.fifo that points failed messages to DLQsendgrid.fifo.
sendgrid.fifo is the main Sendgrid queue from which sendgrid adapter lambda will consuming messages. 

DLQmailgun.fifo and mailgun.fifo that points failed messages to DLQmailgun.fifo.
mailgun.fifo is the main Mailgun queue from which mailgun adapter lambda will consuming messages. 

FailedDelivery.fifo queue for failed messages.

2. Create DynamoDB 'emails' table with uuid key. Table name referenced un util amd emailStatus lambdas.

3. Deploy emailSendRouter. index.handler need to be change to emailSendRouter.handler. Need DynamoDB and SQS access.

Need to configure QUEUE_URL_MAILGUN (points to mailgun.fifo), QUEUE_URL_SENDGRID(points to sendgrid.fifo) and SENDGRID_PROBABILITY (float value from 0 to 1) environment variables.

4. Deploy sendGridAdapter. index.handler need to be change to sendGridAdapter.handler.  Need DynamoDB and SQS access.

Need to configure SENDGRID_API_KEY environment variable, Sendgrid API Key.
5. Deploy mailGunAdapter. index.handler need to be change to mailGunAdapter.handler.  Need DynamoDB and SQS access.

Need to configure MAILGUN_API_KEY environment variable, MailGun API Key.
5. Deploy emailStatus. index.handler need to be change to emailStatus.handler. Need DynamoDB access.

Need to configure MAILGUN_API_KEY environment variable, MailGun API Key.
6. Import [API](https://github.com/leuchankaau/email-service/blob/master/api/openapi.yaml) and point POST to emailSendRouter and GET to emailStatus.
 
 Enable request body validation for POST API, and configure response body on invalid request:
```
{
  "message":$context.error.messageString, 
  "type": $context.error.responseType, 
  "validation":$context.error.validationErrorString
}
``` 
 Enable parameter validation for GET API and enable lambda proxy.
7. Enable SQS sendgrid.fifo trigger for sendGridAdapter with batch size of 1 
8. Enable SQS mailgun.fifo trigger for mailGunAdapter with batch size of 1 
9. Congratulations! Application is deployed and configured.
## Testing
Postman collection for manual testing is attached [here](https://github.com/leuchankaau/email-service/blob/master/email.postman_collection.json).
## Error handling
## Input validation
**Payload**
Validation rules as defined in schema [here](https://app.swaggerhub.com/apis/ToliTest/EmailService/1.0.1).
## Using this service
## TODO
1. CI/CD pipeline to create required resources, API and deploy lambdas.