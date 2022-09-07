export interface NsoCliSerialisedAccount {
  id: string;
  nickname: string;
  sessionToken: string;
}
export const isNsoCliSerialisedAccount = (obj): obj is NsoCliSerialisedAccount =>
  typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.nickname === 'string' && typeof obj.sessionToken === 'string';

export interface NsoCliSerialisedConfig {
  accounts: NsoCliSerialisedAccount[];
  checkVersionOnlyOnce?: boolean;
  hiddenGames?: string[];
  moreDetail?: boolean;
  nsoAppVersion: string;
}
export const isNsoCliSerialisedConfig = (obj): obj is NsoCliSerialisedConfig =>
  typeof obj === 'object' &&
  ((obj.accounts instanceof Array && obj.accounts.reduce((acc, curr) => acc && isNsoCliSerialisedAccount(curr), true)) || typeof obj.accounts === 'undefined') &&
  (typeof obj.checkVersionOnlyOnce === 'boolean' || typeof obj.checkVersionOnlyOnce === 'undefined') &&
  ((obj.hiddenGames instanceof Array && obj.hiddenGames.reduce((acc, curr) => acc && typeof curr === 'string', true)) || typeof obj.hiddenGames === 'undefined') &&
  (typeof obj.moreDetail === 'boolean' || typeof obj.moreDetail === 'undefined') &&
  ((typeof obj.nsoAppVersion === 'string' && /^[0-9]+\.[0-9]+\.[0-9]+/.test(obj.nsoAppVersion)) || typeof obj.nsoAppVersion === 'undefined');
