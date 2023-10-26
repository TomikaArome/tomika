import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Error } from 'mongoose';
import { Response } from 'express';
import { TmkErr } from '@TomikaArome/common';

@Catch(Error.ValidationError)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: Error.ValidationError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const tmkErr = new TmkErr({
      validationErrors: exception.errors
    }, 'A validation error occurred');

    response.status(400).json(tmkErr.toJSON());
  }
}
