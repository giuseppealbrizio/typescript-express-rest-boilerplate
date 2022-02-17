import { Request, Response, NextFunction } from 'express';
import { NotAdminError } from '../../errors';

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.currentUser?.role !== 'admin') {
    throw new NotAdminError();
  }
  next();
};
