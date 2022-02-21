/**
 * This middleware differentiate from the authenticate one
 * because is called after the authentication to retrieve
 * the jwt token stored in the cookie. This is useful to be
 * exported in a shared library
 */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  active: boolean;
  role: string;
  employeeId: string;
  clientId: string;
  vendorId: string;
  // deleted: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

// const secretOrPrivateKey = <string>process.env.JWT_KEY;

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.cookies?.jwt && !req.headers?.authorization) {
    return next();
  }
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      const jwtFromBearer = req.headers?.authorization?.split(' ');

      const jwtToken = jwtFromBearer[1];

      req.currentUser = jwt.verify(
        jwtToken,
        // secretOrPrivateKey,
        // @see https://stackoverflow.com/questions/42273853/in-typescript-what-is-the-exclamation-mark-bang-operator-when-dereferenci
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.JWT_KEY!,
      ) as UserPayload;
    } else if (req.cookies.jwt) {
      req.currentUser = jwt.verify(
        req.cookies.jwt,
        // secretOrPrivateKey,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.JWT_KEY!,
      ) as UserPayload;
    }
  } catch (error) {
    return next(error);
  }
  return next();
};
