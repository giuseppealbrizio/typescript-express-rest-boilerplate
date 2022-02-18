import { PubSub } from '@google-cloud/pubsub';
import debug from 'debug';
import { ApplicationError } from '../../errors';

const DEBUG = debug('dev');

const pubSubClient = new PubSub();

/**
 * Publish a message to a specific topic
 * Payload is an object
 * @param payload {object}
 * @param topicName
 * @returns {Promise<[string]>}
 */
export const publishMessageToPubSub = async (
  payload: object,
  topicName: string,
) => {
  try {
    const dataStringify = JSON.stringify(payload);
    const dataBuffer = Buffer.from(dataStringify);

    const message = {
      data: dataBuffer,
    };

    const messageId = await pubSubClient
      .topic(topicName)
      .publishMessage(message);

    return { messageId };
  } catch (error) {
    DEBUG(error);
    if (error instanceof ApplicationError) {
      throw new ApplicationError(500, error.message);
    }
  }
};
