export enum NsoErrorCode {
  COOKIE_EXPIRED = 'COOKIE_EXPIRED',
  COOKIE_FETCH_FAILED = 'COOKIE_FETCH_FAILED',
  COOKIE_PARSE_FAILED = 'COOKIE_PARSE_FAILED',
  F_TOKEN_FETCH_BAD_RESPONSE = 'F_TOKEN_FETCH_BAD_RESPONSE',
  F_TOKEN_FETCH_FAILED = 'F_TOKEN_FETCH_FAILED',
  GAME_ACCESS_TOKEN_FETCH_BAD_RESPONSE = 'GAME_ACCESS_TOKEN_FETCH_BAD_RESPONSE',
  GAME_ACCESS_TOKEN_FETCH_FAILED = 'GAME_ACCESS_TOKEN_FETCH_FAILED',
  ID_TOKEN_FETCH_BAD_RESPONSE = 'ID_TOKEN_FETCH_BAD_RESPONSE',
  ID_TOKEN_FETCH_FAILED = 'ID_TOKEN_FETCH_FAILED',
  NSO_APP_INSTANCE_NOT_INITIATED = 'NSO_APP_INSTANCE_NOT_INITIATED',
  NSO_APP_VERSION_BADLY_FORMATTED = 'NSO_APP_VERSION_BADLY_FORMATTED',
  NSO_APP_VERSION_FETCH_FAILED = 'NSO_APP_VERSION_FETCH_FAILED',
  REDIRECT_URI_WITHOUT_SESSION_TOKEN_CODE = 'REDIRECT_URI_WITHOUT_SESSION_TOKEN_CODE',
  SESSION_TOKEN_FETCH_BAD_RESPONSE = 'SESSION_TOKEN_FETCH_BAD_RESPONSE',
  SESSION_TOKEN_FETCH_FAILED = 'SESSION_TOKEN_FETCH_FAILED',
  USER_INFO_FETCH_BAD_RESPONSE = 'USER_INFO_FETCH_BAD_RESPONSE',
  USER_INFO_FETCH_FAILED = 'USER_INFO_FETCH_FAILED',
  WEB_API_CREDENTIAL_FETCH_BAD_RESPONSE = 'WEB_API_CREDENTIAL_FETCH_BAD_RESPONSE',
  WEB_API_CREDENTIAL_FETCH_FAILED = 'WEB_API_CREDENTIAL_FETCH_FAILED',

  INCORRECT_GAME_PROVIDED = 'INCORRECT_GAME_PROVIDED',

  SPLATOON_3_BATTLE_FETCH_BAD_RESPONSE = 'SPLATOON_3_BATTLE_FETCH_BAD_RESPONSE',
  SPLATOON_3_BATTLE_FETCH_FAILED = 'SPLATOON_3_BATTLE_FETCH_FAILED',
  SPLATOON_3_BULLET_TOKEN_FETCH_BAD_RESPONSE = 'SPLATOON_3_BULLET_TOKEN_FETCH_BAD_RESPONSE',
  SPLATOON_3_BULLET_TOKEN_FETCH_FAILED = 'SPLATOON_3_BULLET_TOKEN_FETCH_FAILED',
  SPLATOON_3_GRAPH_QL_FETCH_BAD_RESPONSE = 'SPLATOON_3_GRAPH_QL_FETCH_BAD_RESPONSE',
  SPLATOON_3_GRAPH_QL_FETCH_FAILED = 'SPLATOON_3_GRAPH_QL_FETCH_FAILED',
  SPLATOON_3_LATEST_BATTLES_FETCH_BAD_RESPONSE = 'SPLATOON_3_LATEST_BATTLES_FETCH_BAD_RESPONSE',
  SPLATOON_3_LATEST_BATTLES_FETCH_FAILED = 'SPLATOON_3_LATEST_BATTLES_FETCH_FAILED',
  SPLATOON_3_LATEST_SALMON_RUN_SHIFTS_FETCH_BAD_RESPONSE = 'SPLATOON_3_LATEST_SALMON_RUN_SHIFTS_FETCH_BAD_RESPONSE',
  SPLATOON_3_LATEST_SALMON_RUN_SHIFTS_FETCH_FAILED = 'SPLATOON_3_LATEST_SALMON_RUN_SHIFTS_FETCH_FAILED',
  SPLATOON_3_SALMON_RUN_SHIFT_FETCH_BAD_RESPONSE = 'SPLATOON_3_SALMON_RUN_SHIFT_FETCH_BAD_RESPONSE',
  SPLATOON_3_SALMON_RUN_SHIFT_FETCH_FAILED = 'SPLATOON_3_SALMON_RUN_SHIFT_FETCH_FAILED',
  SPLATOON_3_SPLATNET_VERSION_FETCH_FAILED = 'SPLATOON_3_SPLATNET_VERSION_FETCH_FAILED',
  SPLATOON_3_SPLATNET_OUT_OF_DATE = 'SPLATOON_3_SPLATNET_OUT_OF_DATE',
  SPLATOON_3_USER_NOT_REGISTERED = 'SPLATOON_3_USER_NOT_REGISTERED',
}

export class NsoError extends Error {
  constructor(
    message: string,
    public code: NsoErrorCode,
    public details: unknown = {}
  ) {
    super(message);
  }
}
