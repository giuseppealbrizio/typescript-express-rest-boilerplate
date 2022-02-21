import { Request, Response } from 'express';
import debug from 'debug';
import { ApplicationError } from '../errors';

const DEBUG = debug('dev');

export default {
  /**
   * Test controller - Protected router test
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  checkRouteProtection: async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Yes you are authenticated and the test is completed',
      },
    });
  },
  /**
   * Test controller - This is a test controller to retrieve the user logged
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  checkUserLogged: async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        status: 'success',
        message: 'User logged retrieved',
        userInPassport: req?.user,
        userInSession: req?.session,
        userInCustomMiddleware: req?.currentUser,
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
};
