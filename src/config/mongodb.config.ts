import debug from 'debug';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.utils';
import { ApplicationError } from '../errors';

mongoose.connection.on('connected', () => {
  console.log('🔥 MongoDB Connection Established');
});

mongoose.connection.on('reconnected', () => {
  console.log('🌈 MongoDB Connection Reestablished');
});

mongoose.connection.on('disconnected', () => {
  console.log('💀 MongoDB Connection Disconnected');
});

mongoose.connection.on('close', () => {
  console.log('🚪 MongoDB Connection Closed');
});

mongoose.connection.on('error', (error: string) => {
  console.log(`🤦🏻 MongoDB ERROR: ${error}`);

  process.exit(1);
});

const DEBUG = debug('dev');

export default {
  MongoDB: async () => {
    try {
      await mongoose.connect(<string>process.env.MONGO_URI);
      logger.info(`Connected to db: ${mongoose.connection.name}`);
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(500, error.message);
      }
    }
  },
  MongoDBTest: async () => {
    try {
      await mongoose.connect(<string>process.env.MONGO_URI_TEST);
      logger.info(`Connected to db: ${mongoose.connection.name}`);
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(500, error.message);
      }
    }
  },
};
