export interface NsoCliSerialisedAccount {
  id: string;
  nickname: string;
  sessionToken: string;
}
export const isNsoCliSerialisedAccount = (obj): obj is NsoCliSerialisedAccount =>
  typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.nickname === 'string' && typeof obj.sessionToken === 'string';

export interface NsoCliSerialisedConfig {
  accounts: NsoCliSerialisedAccount[];
}
export const isNsoCliSerialisedConfig = (obj): obj is NsoCliSerialisedConfig =>
  typeof obj === 'object' && obj.accounts instanceof Array && obj.accounts.reduce((acc, curr) => acc && isNsoCliSerialisedAccount(curr), true);
