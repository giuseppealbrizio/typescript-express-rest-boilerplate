import { NextFunction, Request, Response } from 'express';

/**
 * Catch Async Errors in routes
 * @param catchAsync
 * @return {(function(*=, *=, *=): Promise<*|undefined>)|*}
 */

export default (catchAsync: Function) =>
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      catchAsync(request, response, next);
    } catch (error) {
      return next(error);
    }
  };
