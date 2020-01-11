# Email-service Architecture 
## Summary
Main idea of this service architecture to take responsibility for email delivery, to allow other components reduce error handling coplexity in case of failed email.
Other approach can be if email delivery fails deliver thorough other email provider or method(e.g. sms or post). 
Architecture uses serverless pattern with use of AWS API Gateway, Lambda and SQS. 
 
 **The diagram have 3 flows:**
 * [1.1-1.3 Accepting message for processing](#Accepting-message-for-processing) 
 * [2.1-2.4 and 3.1-3.4 Processing message by providers](#Processing-message-by-providers) 
 * [E.1-E.3 Failed Delivery Handling](#Failed-Delivery-Handling) 
 
[**Decisions**](#Decisions)
 
[ **Security**](#Security) 
 
[ **New Provider**](#New-Provider) 

[ **Cost**](#Cost) 
 
![alt text](https://github.com/leuchankaau/email-service/blob/master/EmailService.png)

## Accepting message for processing
API Gateway accepts message and validate according to schema. Decision#2
Lambda  takes responsibility of routing between providers, there is a bit of mix concerns ideally we want to separate, but to simplify purpose and lack of special rules validation we can keep it as is.

Lambda routes message based on environment variables between providers queues. Load balancer can also be used for routing and would be much more elegant, but we avoid it to reduce complexity.

## Processing message by providers
Message pulled by lambda and sent to provider, if successful response acknowledge delivery, if error push back to queue and retry (time configured in a queue).After several retries queue will push it to dead letter queue DLQ. DLQ is undelivered-message queue, is a holding queue for messages that failed delivery to their destination, here it will caused by provider errors.
## Failed Delivery Handling
Pull message from Provider error queues, update with info that it failed for provider and push it to another provider, if all providers failed then forward it to error for manual handling. 
## Decisions
1. **Serverless vs standard microservice**
Serverless Architecture with API gateway allows to build decoupled solution without overhead of managing guaranteed delivery through database or other sources. 
Lambda can be scaled through configuration. Cost of running of the solution can be considered a benefit as well.
2. **API Gateway input validation vs Javascript validation.**
API Gateway allows validate payload using JSON schema, technical validations that can be done through type definitions.
Allows consistent API contract with validation, without managing extra code for validations. Main disadvantage very limited control over AWS response messages. 
3. **Load balancer vs Lambda router.**
Load balancer can do routing for lambda through configuration, but for purpose of this exercise it will be done using random number. 
4. **Tracking current status of message in DB**
Mailgun have semi business validation rules, where they can consider request invalid to repetition of email address as invalid request.
Developers should be able to get status of the message and errors associated with it.
5. **Storing vs not storing content of a message in DB.**
Storing content of a message can be security hazard. in case if messages will contain personal information.
6. **Lambda for monitoring and notification in case if error queue get messages - TODO**
Ideally we want to notify DevOps team if providers is down, so they can redirect traffic.
7. **Environment variables vs config file.**
Lambda preferred method of configuration is environment variables as it can be created during lambda creation, does not require redeployment, and can be dynamically updated in AWS by other lambdas.
## New Provider
You need to complete **3 steps** to add new provider:
1. Implement provider flow with main queue(SQS) and dead letter queue(DLQ) for provider message, and lambda integration component.
2. **Update Failed Delivery handling** to add new provider message.
3. Change router to enable routing between 3 providers  
## Security
Email service is important part of security and should not be exposed to public due to follow potential scenarios:
1. Attacker can create email from our organisation with requests of payments or personal information.
2. Attacker can send viruses to out customer.
3. Attacker might access to content of messages.
It would be also good idea store message in encrypted, so if attacker will get access to data, it will nee decryption.

Methods should allow check message status. 
## Cost
Lambda cost is $0.20 per 1M request and $0.000016667 for every GB-second.

EC2 t3.micro of $0.0146 per hour, which is 2o$ for 2 instances (to minimum allow scalability) per month.  


