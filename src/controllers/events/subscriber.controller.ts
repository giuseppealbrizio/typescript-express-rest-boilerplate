import { Request, Response } from 'express';
import { PubSub } from '@google-cloud/pubsub';
import debug from 'debug';
import { ApplicationError } from '../../errors/Application.error';

const DEBUG = debug('dev');

// Creates a Pub/Sub client; cache this for further use
const pubSubClient = new PubSub();

/**
 * PUSH EVENTS SUBSCRIBER
 */
/**
 * Example of subscription to push event
 * @param req
 * @param res
 * @return {Promise<*>}
 */
export const subscribeToPushEventExample = async (
  req: Request,
  res: Response,
) => {
  try {
    // Await for message coming from Pub/Sub in a push notification.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const data = Buffer.from(req.body.message.data, 'base64').toString('utf-8');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await JSON.parse(data);

    // const foundUser = await UserService.findUserById(messageResponse.userId);
    // console.log(`${foundUser?.username} ha appena mandato una richiesta`);

    console.log('Push event contains this object: ', result);

    res.status(200).send();
  } catch (error) {
    DEBUG(error);
    if (error instanceof ApplicationError) {
      throw new ApplicationError(500, error.message);
    }
  }
};

/**
 * PULL EVENTS SUBSCRIBER
 */
/**
 * Example of subscription to pull event
 * @param req
 * @param res
 * @return {Promise<void>}
 */
export const subscribeToPullEventExample = (): void => {
  try {
    // Define some options for subscription
    const subscriberOptions = {
      flowControl: {
        maxMessages: 10,
      },
    };

    // References an existing subscription
    const subscription = pubSubClient.subscription(
      'subscription_name',
      subscriberOptions,
    );

    // Instantiate the message counter
    let messageCount = 0;

    // Create an event handler to handle messages
    const messageHandler = (message: any) => {
      // Buffering the message data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const data = Buffer.from(message.data, 'base64').toString('utf-8');

      // Parse message in a JSON Object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = JSON.parse(data);

      // Do something with the result
      console.log(response);

      // Increase message counter
      messageCount += 1;

      // "Ack" (acknowledge receipt of) the message
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      message.ack();
    };

    // Create an event handler to handle errors
    // eslint-disable-next-line func-names
    const errorHandler = function (error: Error) {
      if (error instanceof ApplicationError) {
        throw new ApplicationError(301, error.message);
      }
    };

    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);

    // Listen for errors
    subscription.on('error', errorHandler);

    // Set the timeout to 60 seconds
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
      subscription.removeListener('error', errorHandler);
      console.log(`${messageCount} message(s) received.`);
    }, 60 * 1000);
    // TODO: Check if this function has to return anything
  } catch (error) {
    DEBUG(error);
    if (error instanceof ApplicationError) {
      throw new ApplicationError(500, error.message);
    }
  }
};
