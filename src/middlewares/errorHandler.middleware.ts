/**
 * This middleware is responsible for returning a json every time
 * an error comes in. We use in the app.js as global middleware
 */
import { config } from 'dotenv';
import debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { ApplicationError } from '../errors';

config();

const DEBUG = debug('dev');

export default (
  err: ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let errorMessage = {};

  if (res.headersSent) {
    return next(err);
  }

  if (!isProduction) {
    DEBUG(err.stack);
    errorMessage = err;
  }

  if (err) {
    return res.status(err.statusCode || 500).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      error: {
        message: err.message,
        ...(!isProduction && { trace: errorMessage }),
      },
    });
  }
};
