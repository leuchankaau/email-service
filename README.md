# Email-service
You can see swagger doc [here](https://app.swaggerhub.com/apis/ToliTest/EmailService/1.0.0) that points to running [API](https://jk8ncbovj6.execute-api.us-east-2.amazonaws.com/test/).

Email service API to provide an abstraction between different email service providers. Service takes managing delivery to a customer responsibility, manages load and fail-over between providers and allows delivery monitoring. Current supported providers Mailgun and SendGrid.  

## Table of contents
  * [Table of contents](#table-of-contents)
  * [Getting Started](#Getting-Started)
  * [Project Structure](#Project-Structure)  
  * [Testing](#testing)
  * [Error Handling](#error-handling)
  * [Input validation](#input-validation)
  * [Using this service](#using-this-service)

## Getting Started
Architecture overview can be found [here](https://github.com/leuchankaau/email-service/blob/master/ARCHITECTURE.md)
Project build using AWS Lambda, API Gateway, SQS and DynamoDB.
## Project Structure
1. API definition can be found [here](https://github.com/leuchankaau/email-service/blob/master/api/openapi.yaml). API defines contract with consumer. yaml file used to generate AWS API Gateway.
2. EmailSendRouter lambda that accepts POST email API call, creates message and puts it to one of provider queues.
Decision made randomly based on environment variable. Lambda records messages in DynamoDB.
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/emailSendRouter/index.js). 
Lambda have dependency on util library [here](https://github.com/leuchankaau/email-service/blob/master/util/util.js)
3. SendGridAdapter lambda that get a message from the SendGrid queue, and sends it to SendGrid. 
Lambda records messages with response in DynamoDB. 
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/sendGridAdapter/index.js). 
Lambda have dependency on util library [here](https://github.com/leuchankaau/email-service/blob/master/util/util.js)
4. MailGunAdapter lambda that get a message from the MailGun queue, and sends it to MailGun. 
Lambda records messages with response in DynamoDB. 
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/mailGunAdapter/index.js). 
Lambda have dependency on util library [here](https://github.com/leuchankaau/email-service/blob/master/util/util.js)
5. EmailStatus lambda that  accepts GET email API call, requires a query uuid parameter.
Lambda use uuid parameter to get message status from DynamoDB and prepare it response to developer. 
Lambda can be found here [here](https://github.com/leuchankaau/email-service/blob/master/emailStatus/index.js). 
6. Util javascript library with constants and reusable functions. 
Util can be found here [here](https://github.com/leuchankaau/email-service/blob/master/util/util.js). 
## Testing
## Error handling
## Input validation
**Payload**
Validation rules as defined in schema [here](https://app.swaggerhub.com/apis/ToliTest/EmailService/1.0.0).
