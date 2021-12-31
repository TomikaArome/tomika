import { OuistitiErrorType } from '../enum/ouistiti-error-type.enum';

export interface OuistitiError {
  caller: string;
  type: OuistitiErrorType;
  detail: any;
}
