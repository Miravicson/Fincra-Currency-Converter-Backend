import { HttpException } from '@nestjs/common';

export class ValidationException extends HttpException {
  private errorMessages: Record<string, any>;

  constructor(errorMessages: Record<string, any>) {
    super('Invalid data supplied', 400);
    this.errorMessages = errorMessages;
  }

  public getErrorMessages() {
    return this.errorMessages;
  }
}
