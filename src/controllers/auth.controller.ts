import { NextFunction, Request, Response } from 'express';
import debug from 'debug';
import { ApplicationError } from '../errors';
import User, { IUserDocument } from '../models/user.model';
import { CurrentUserPayload } from '../interfaces/models/user.interface';
import emailService from '../services/email/sendgrid.service';
import userService from '../services/user.service';
import passportLocal from '../services/passport/passport-local.service';

const DEBUG = debug('dev');

/**
 * This function returns a json with user data,
 * token and the status and set a cookie with
 * the name jwt. We use this in the response
 * of login or signup
 * @param user
 * @param statusCode
 * @param req
 * @param res
 */
const createCookieFromToken = (
  user: IUserDocument,
  statusCode: number,
  req: Request,
  res: Response,
) => {
  const token = user.generateVerificationToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    token_expires: cookieOptions.expires,
    data: {
      user,
    },
  });
};

export default {
  /**
   *
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>}
   */
  signup: async (req: Request, res: Response, next: NextFunction) => {
    passportLocal.authenticate(
      'signup',
      { session: false },
      async (err, user, info) => {
        try {
          if (err || !user) {
            const { statusCode = 400, message } = info;
            return res.status(statusCode).json({
              status: 'error',
              error: {
                message,
              },
            });
          }
          createCookieFromToken(user, 201, req, res);
        } catch (error) {
          DEBUG(error);
          if (error instanceof ApplicationError) {
            throw new ApplicationError(error.statusCode, error.message);
          }
        }
      },
    )(req, res, next);
  },
  /**
   * Login controller
   * @param req
   * @param res
   * @param next
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    passportLocal.authenticate(
      'login',
      { session: false },
      async (err, user, info) => {
        try {
          if (err || !user) {
            let message = err;
            if (info) {
              message = info.message;
            }
            return res.status(401).json({
              status: 'error',
              error: {
                message,
              },
            });
          }
          // call req.login manually to set the session and
          // init passport correctly in serialize & deserialize
          req.logIn(user, function (error) {
            if (error) {
              return next(error);
            }
          });

          // generate a signed json web token with the contents of user
          // object and return it in the response
          createCookieFromToken(user, 200, req, res);
        } catch (error) {
          console.log(error);
          DEBUG(error);
          if (error instanceof ApplicationError) {
            throw new ApplicationError(error.statusCode, error.message);
          }
        }
      },
    )(req, res, next);
  },
  /**
   * Logout controller that delete cookie named jwt
   * @param req
   * @param res
   * @param next
   * @return {Promise<*>}
   */
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('jwt');
      res.clearCookie('connect.sid');
      req.session.destroy(function (error) {
        if (error) {
          return next(error);
        }
        return res.status(200).json({
          status: 'success',
          message: 'You have successfully logged out',
        });
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
  /**
   * Request a password recovery and
   * send an email with a token to use in
   * the resetPassword Controller
   * @param req
   * @param res
   * @return {Promise<*>}
   */
  recoverPassword: async (req: Request, res: Response) => {
    try {
      // Destroy session and remove any cookie
      req.session.destroy(() => {
        res.clearCookie('jwt');
      });

      res.clearCookie('jwt');

      const { email } = req.body;
      const user = await User.findOne({ email }).exec();

      if (!user) {
        return res.status(404).json({
          status: 'error',
          error: {
            status: 'error',
            message: 'User not found',
          },
        });
      }

      // Generate and set password reset token
      user.generatePasswordResetToken();

      // Save the updated user object with a resetPasswordToken and expire
      await user.save();

      // Send email to the user with the token
      await emailService.sendResetPasswordToken(
        user.email,
        user.resetPasswordToken as string,
      );

      res.status(200).json({
        status: 'success',
        message: `A reset email has been sent to ${user.email}.`,
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
  /**
   * Reset password controller
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>}
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    passportLocal.authenticate(
      'reset-password',
      { session: false },
      async (err, user, info) => {
        try {
          if (err || !user) {
            let message = err;
            if (info) {
              message = info.message;
            }
            return res.status(400).json({
              status: 'error',
              error: {
                message,
              },
            });
          }

          res.status(200).json({
            status: 'success',
            message: 'Password successfully updated',
          });
        } catch (error) {
          DEBUG(error);
          if (error instanceof ApplicationError) {
            throw new ApplicationError(error.statusCode, error.message);
          }
        }
      },
    )(req, res, next);
  },
  /**
   * Social authentication controller
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  socialAuth: async (req: Request, res: Response) => {
    try {
      const { authInfo, user } = req;
      console.log(authInfo);
      createCookieFromToken(<any>user, 201, req, res);
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
  /**
   * Return the logged user
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  loggedUser: async (req: Request, res: Response) => {
    try {
      const { id } = <CurrentUserPayload>req.currentUser;

      const user = await userService.findUserById(id);

      res.status(200).json({
        status: 'success',
        message: 'User logged retrieved',
        data: {
          user,
        },
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
};
