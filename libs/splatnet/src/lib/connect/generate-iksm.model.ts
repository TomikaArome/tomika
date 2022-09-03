export interface NsoGameService {
  id: number;
  host: string;
  name: string;
  cookieName: string;
}

export interface SessionTokenResponse {
  session_token: string;
  code: string;
}
export const isSessionTokenResponse = (obj): obj is SessionTokenResponse =>
  typeof obj?.session_token === 'string' && typeof obj?.code === 'string';

export interface IdTokenResponse {
  scope: string[];
  expires_in: number;
  id_token: string;
  access_token: string;
  token_type: 'Bearer';
}
export const isIdTokenResponse = (obj): obj is IdTokenResponse =>
  obj?.scope instanceof Array && typeof obj?.expires_in === 'number' && typeof obj?.id_token === 'string' && typeof obj?.access_token === 'string' && obj?.token_type === 'Bearer';

export interface IdToken {
  scope: string[];
  expires: number;
  idToken: string;
  accessToken: string;
  tokenType: 'Bearer';
}
export const isIdToken = (obj): obj is IdToken =>
  obj?.scope instanceof Array && typeof obj?.expires === 'number' && typeof obj?.idToken === 'string' && typeof obj?.accessToken === 'string' && obj?.tokenType === 'Bearer';

export interface UserInfoForAuth {
  id: string;
  nickname: string;
  country: string;
  birthday: string;
  language: 'en-US' | 'en-MX' | 'fr-CA' | 'ja-JP' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'nl-NL' | 'ru-RU';
}
export const isUserInfoForAuth = (obj): obj is UserInfoForAuth =>
  typeof obj?.id === 'string' && typeof obj?.nickname === 'string' && typeof obj?.country === 'string' && typeof obj?.birthday === 'string'
  && ['en-US', 'en-MX', 'fr-CA', 'ja-JP', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'nl-NL', 'ru-RU'].includes(obj?.language);

export interface FTokenResponse {
  f: string;
  request_id: string;
  timestamp: number;
}
export const isFTokenResponse = (obj): obj is FTokenResponse =>
  typeof obj?.f === 'string' && typeof obj?.request_id === 'string' && typeof obj?.timestamp === 'number';

export interface WebApiServerCredentialResponse {
  result: {
    webApiServerCredential: AccessTokenResponse;
  }
}
export const isWebApiServerCredentialResponse = (obj): obj is WebApiServerCredentialResponse => isAccessTokenResponse(obj?.result?.webApiServerCredential)

export interface AccessTokenResponse {
  accessToken: string;
  expiresIn: number;
}
export const isAccessTokenResponse = (obj): obj is AccessTokenResponse =>
  typeof obj?.accessToken === 'string' && typeof obj?.expiresIn === 'number';

export interface AccessToken {
  accessToken: string;
  expires: number;
}

export interface NsoGameServiceCookie {
  fullHeader?: string;
  value: string;
  expires: number;
}
