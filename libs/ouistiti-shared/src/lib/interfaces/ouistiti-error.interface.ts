import { OuistitiErrorType, OuistitiInvalidActionReason } from '../enum/ouistiti-error-type.enum';

interface NoDetail {
  type: OuistitiErrorType.REQUIRED_PARAM | OuistitiErrorType.INCORRECT_PASSWORD | OuistitiErrorType.HOST_CANNOT_KICK_SELF;
}

interface InvalidActionDetail {
  type: OuistitiErrorType.INVALID_ACTION;
  detail: {
    reason: OuistitiInvalidActionReason
  }
}

interface StringLengthDetail {
  type: OuistitiErrorType.STRING_TOO_LONG;
  detail: {
    value: string;
    requiredLength: number;
    actualLength: number;
  }
}

interface NumberRangeDetail {
  type: OuistitiErrorType.NUMBER_OUT_OF_RANGE;
  detail: {
    provided: number;
    minimum?: number;
    maximum?: number;
  }
}

interface InvalidIdDetail {
  type: OuistitiErrorType.INVALID_ID,
  detail: {
    provided: string;
  }
}

interface ElementInArrayTakenDetail {
  type: OuistitiErrorType.VALUE_TAKEN;
  detail: {
    provided: unknown;
    taken: unknown[];
  }
}

interface OrderArrayIncompleteDetail {
  type: OuistitiErrorType.ORDER_ARRAY_INCOMPLETE;
  detail: {
    provided: string[];
    missing: string[];
  }
}

interface PlayerDoesntHaveCardDetail {
  type: OuistitiErrorType.PLAYER_DOESNT_HAVE_CARD,
  detail: {
    provided: string;
    actual: string[];
  }
}

type CombinedErrorType = NoDetail | InvalidActionDetail | StringLengthDetail | NumberRangeDetail | InvalidIdDetail |
  ElementInArrayTakenDetail | OrderArrayIncompleteDetail | PlayerDoesntHaveCardDetail;

export type OuistitiError = CombinedErrorType & {
  param?: string;
  caller?: string;
}
