import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';
import { TmkErr, TmkErrConflict } from '@TomikaArome/common';

@Catch(MongoError)
export class MongoErrorFilter implements ExceptionFilter {
  catch(error: MongoError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let tmkErr: TmkErr;
    let httpStatus = 500;

    switch (error.code) {
      case 11000:
        tmkErr = this.processConflictError(error);
        httpStatus = 409;
        break;
      default:
        tmkErr = new TmkErr({
          originalError: error
        }, 'An unexpected MongoDB error occurred. See https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.yml for a list of error codes');
    }

    response.status(httpStatus).json(tmkErr.toJSON());
  }

  private processConflictError(error: MongoError): TmkErrConflict {
    const keyValue = Object.entries(error['keyValue']);
    return new TmkErrConflict({
      path: keyValue[0]?.[0],
      value: keyValue[0]?.[1]
    });
  }
}
