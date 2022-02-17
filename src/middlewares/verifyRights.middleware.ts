import { NextFunction, Request, Response } from 'express';
import { roleRights } from '../config/roles.config';
import { ApplicationError } from '../errors';

export const verifyRights =
  (...requiredRights: Array<string>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (requiredRights?.length) {
      const userRights = <Array<string>>(
        roleRights.get(<string>req.currentUser?.role)
      );

      const hasRequiredRights = requiredRights.every((requiredRight: string) =>
        userRights?.includes(requiredRight),
      );

      if (
        !hasRequiredRights &&
        req.params.userId !== <string>req.currentUser?.id
      ) {
        throw new ApplicationError(
          403,
          'You are not authorized to use this endpoint',
        );
      }
    }
    next();
  };
