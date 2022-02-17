import { Request, Response } from 'express';
import debug from 'debug';
import { ApplicationError } from '../errors';
import appService from '../services/app.service';
import { IFilterObject } from '../interfaces/common.interface';

const DEBUG = debug('dev');

export default {
  getAll: async (req: Request, res: Response) => {
    try {
      const filter: IFilterObject = {
        q: <string>req?.query?.q,
      };

      const resource = await appService.findAll(filter);

      res.status(200).json({
        status: 'success',
        message: 'Resources successfully working',
        data: { resource },
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
  getOne: async (req: Request, res: Response) => {
    try {
      const resource = await appService.findOne(req.params.id);

      res.status(200).json({
        status: 'success',
        message: 'Resource successfully working',
        data: { resource },
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const resource = await appService.findOneAndUpdate(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        status: 'success',
        message: 'Resource successfully updated',
        data: { resource },
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
  deleteOne: async (req: Request, res: Response) => {
    try {
      const resource = await appService.findOneAndDelete(req.params.id);

      res.status(200).json({
        status: 'success',
        message: 'Resource successfully deleted',
        data: { resource },
      });
    } catch (error) {
      DEBUG(error);
      if (error instanceof ApplicationError) {
        throw new ApplicationError(error.statusCode, error.message);
      }
    }
  },
};
