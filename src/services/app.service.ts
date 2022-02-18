import cleanDeep from 'clean-deep';
// import { ApplicationError } from '../errors';
// eslint-disable-next-line import/no-named-as-default
import App from '../models/app.model';
import { IFilterObject } from '../interfaces/common.interface';

export default {
  findAll: async (filter: IFilterObject): Promise<string> => {
    const cleanedObject = cleanDeep(filter);

    return `This service should return all resources and an object ${cleanedObject}`;
  },
  findOne: async (id: string): Promise<string> => {
    return `This service should return ${id} resource`;
  },
  findOneAndUpdate: async (id: string, body: object): Promise<string> => {
    return `This service should update ${id} resource with this body ${body}`;
  },
  findOneAndSoftDelete: async (id: string): Promise<string> => {
    const app = await App.findOne({ id });

    if (app) {
      await app.delete();
    }

    return `The object is soft deleted ${app}`;
  },
  findOneAndDelete: async (id: string): Promise<string> => {
    return `This service should delete ${id} resource `;
  },
};
