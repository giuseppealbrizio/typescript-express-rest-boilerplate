import { ApplicationError } from './Application.error';

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(404, message || 'Resource not found');
  }
}
