export enum NsoOperationType {
  GET_COOKIE = 'GET_COOKIE',
  GET_F_TOKEN_HASH_METHOD_1 = 'GET_F_TOKEN_HASH_METHOD_1',
  GET_F_TOKEN_HASH_METHOD_2 = 'GET_F_TOKEN_HASH_METHOD_2',
  GET_GAME_ACCESS_TOKEN = 'GET_GAME_ACCESS_TOKEN',
  GET_ID_TOKEN = 'GET_ID_TOKEN',
  GET_NSO_APP_VERSION = 'GET_NSO_APP_VERSION',
  GET_SESSION_TOKEN = 'GET_SESSION_TOKEN',
  GET_WEB_API_ACCESS_TOKEN = 'GET_WEB_API_ACCESS_TOKEN',
  GET_USER_INFO = 'GET_USER_INFO',

  SPLATOON_3_BATTLE = 'SPLATOON_3_BATTLE',
  SPLATOON_3_BULLET_TOKEN = 'SPLATOON_3_BULLET_TOKEN',
  SPLATOON_3_GRAPH_QL = 'SPLATOON_3_GRAPH_QL',
  SPLATOON_3_LATEST_BATTLES = 'SPLATOON_3_LATEST_BATTLES',
  SPLATOON_3_LATEST_SALMON_RUN_SHIFTS = 'SPLATOON_3_LATEST_SALMON_RUN_SHIFTS',
  SPLATOON_3_SALMON_RUN_SHIFT = 'SPLATOON_3_SALMON_RUN_SHIFT'
}

export class NsoOperation {
  private resolveFn;
  private rejectFn;
  completed: Promise<void> = new Promise<void>((resolve, reject) => {
    this.resolveFn = resolve;
    this.rejectFn = reject;
  });

  constructor(public type: NsoOperationType, public label: string) {}

  complete() {
    this.resolveFn();
  }

  fail() {
    this.rejectFn();
  }
}
