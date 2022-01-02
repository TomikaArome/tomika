import { OuistitiError, OuistitiErrorType } from '@TomikaArome/ouistiti-shared';
import { WsException } from '@nestjs/websockets';

export class OuistitiException extends WsException {
  static requiredParam(requiredParamKey: string): OuistitiException {
    return new OuistitiException({
      type: OuistitiErrorType.REQUIRED_PARAM,
      param: requiredParamKey
    });
  }

  static checkRequiredParams(obj: unknown, keys: string[]) {
    keys.forEach((fullKey: string) => {
      const splitKey: string[] = fullKey.split('.');
      splitKey.reduce((acc: unknown, currentKey: string) => {
        if (!acc[currentKey]) { throw OuistitiException.requiredParam(fullKey); }
        return acc[currentKey];
      }, obj);
    });
  }

  constructor(error: OuistitiError) {
    super(error);
  }

  getError(): OuistitiError {
    return super.getError() as OuistitiError;
  }
}
