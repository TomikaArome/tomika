export enum NsoCliErrorCode {
  CONFIG_BADLY_FORMED_JSON = 'CONFIG_BADLY_FORMED_JSON',
  CONFIG_FETCH_FAILED = 'CONFIG_FETCH_FAILED',
  CONFIG_SAVE_FAILED = 'CONFIG_SAVE_FAILED',
  JSON_SAVE_FAILED = 'JSON_SAVE_FAILED',
}

export class NsoCliError extends Error {
  constructor(
    message: string,
    public code: NsoCliErrorCode,
    public details: unknown = {}
  ) {
    super(message);
  }
}
