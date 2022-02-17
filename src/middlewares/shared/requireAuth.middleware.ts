import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../../errors';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.log(req.currentUser);
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }
  next();
};
