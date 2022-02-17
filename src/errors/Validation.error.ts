import { ApplicationError } from './Application.error';

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(404, message || 'Path is required');
  }
}
