import { PubSub, Message } from '@google-cloud/pubsub';

export type IDataBuffer = {
  json?: any;
};

export type IPubSubMessage = Message;

export default {
  /**
   * Publish a message to Pub/Sub Cloud to a specified topic
   * created in GCP
   * @param pubSubClient
   * @param topicName
   * @param payload
   * @return {Promise<*>}
   */
  publishMessage: async (
    pubSubClient: PubSub,
    topicName: string,
    payload: string,
  ): Promise<string> => {
    const dataBuffer = <IDataBuffer>Buffer.from(JSON.stringify(payload));

    const messageId = await pubSubClient
      .topic(topicName)
      .publishMessage(dataBuffer);
    console.log(`Message ${messageId} published.`);
    return messageId;
  },
  /**
   * Listen for the message published by
   * Pub/Sub Cloud with a subscription
   * that is configured to listen on that
   * specified topic
   * @param pubSubClient
   * @param subscriptionName
   * @param timeout
   */
  listenForPullMessages: (
    pubSubClient: PubSub,
    subscriptionName: string,
    timeout: number,
  ) => {
    const subscription = pubSubClient.subscription(subscriptionName);

    let messageCount = 0;
    const messageHandler = (message: IPubSubMessage) => {
      console.log(`Received message ${message.id}:`);
      console.log(`\tData: ${message.data}`);
      console.log(`\tAttributes: ${message.attributes}`);
      messageCount += 1;

      message.ack();
    };

    subscription.on('message', messageHandler);

    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
      console.log(`${messageCount} message(s) received.`);
    }, timeout * 1000);
  },
  /**
   * Since the subscription is a Push subscription,
   * Google Pub/Sub send back the message as soon
   * as possible and this controller receive the message
   * @param payload
   * @return {any}
   */
  listenForPushMessages: (payload: string) => {
    const message = <string>Buffer.from(payload, 'base64').toString('utf-8');
    const parsedMessage = JSON.parse(message);
    console.log('Hey publisher message received:', parsedMessage);
    return parsedMessage;
  },
};
