export interface IdToken {
  scope: string[];
  expires: number;
  idToken: string;
  accessToken: string;
  tokenType: 'Bearer';
}
export const isIdToken = (obj): obj is IdToken =>
  obj?.scope instanceof Array &&
  typeof obj?.expires === 'number' &&
  typeof obj?.idToken === 'string' &&
  typeof obj?.accessToken === 'string' &&
  obj?.tokenType === 'Bearer';

export interface AccessToken {
  accessToken: string;
  expires: number;
}

export interface NsoGame {
  id: number;
  host: string;
  name: string;
  cookieName: string;
}

export interface NsoGameCookie {
  fullHeader?: string;
  value: string;
  expires: number;
}
