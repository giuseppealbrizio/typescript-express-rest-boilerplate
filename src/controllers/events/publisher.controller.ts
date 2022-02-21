import { Request, Response } from 'express';
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
  } catch (error: any) {
    DEBUG(error);
    if (error instanceof ApplicationError) {
      throw new ApplicationError(500, error.message);
    }
  }
};

/**
 * This controller is used in the router to publish a message to a specific topic
 * through the PubSub API declared up here
 * @return {Promise<any>}
 * @param req
 * @param res
 */
export const publishEventExample = async (req: Request, res: Response) => {
  try {
    const payload = { body: 'This is an example of a payload' };
    const topic = 'topic_name';
    const messageId = await publishMessageToPubSub(payload, topic);

    res.status(200).json({
      status: 'success',
      message: messageId ? 'Event pushed to pub/sub' : 'Event not pushed',
      data: { messageId: messageId || 'Not found' },
    });
  } catch (error) {
    DEBUG(error);
    if (error instanceof ApplicationError) {
      throw new ApplicationError(500, error.message);
    }
  }
};
