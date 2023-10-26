import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TmkErr, TmkErrConflict, TmkErrNotFound } from '@TomikaArome/common';
import { Response } from 'express';

@Catch(TmkErr)
export class TmkErrFilter implements ExceptionFilter {
  catch(exception: TmkErr, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    if (exception instanceof TmkErrNotFound) { status = 404; }
    if (exception instanceof TmkErrConflict) { status = 409; }

    response.status(status).json(exception.toJSON());
  }
}
