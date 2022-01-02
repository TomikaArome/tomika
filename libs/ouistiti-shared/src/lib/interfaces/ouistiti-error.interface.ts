import { OuistitiErrorType } from '../enum/ouistiti-error-type.enum';

interface NoDetail {
  type: OuistitiErrorType.REQUIRED_PARAM | OuistitiErrorType.INCORRECT_PASSWORD
}

interface StringLengthDetail {
  type: OuistitiErrorType.STRING_TOO_LONG,
  detail: {
    value: string;
    requiredLength: number;
    actualLength: number;
  }
}

interface InvalidIdDetail {
  type: OuistitiErrorType.INVALID_ID,
  detail: {
    provided: string;
  }
}

interface NicknameTakenDetail {
  type: OuistitiErrorType.NICKNAME_TAKEN,
  detail: {
    provided: string;
    taken: string[];
  }
}

type CombinedErrorType = NoDetail | StringLengthDetail | InvalidIdDetail | NicknameTakenDetail;

export type OuistitiError = CombinedErrorType & {
  param: string;
  caller?: string;
}
