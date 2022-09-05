import { isLanguageCode, LanguageCode } from '../../model/language-code.model';

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
  obj?.scope instanceof Array &&
  typeof obj?.expires_in === 'number' &&
  typeof obj?.id_token === 'string' &&
  typeof obj?.access_token === 'string' &&
  obj?.token_type === 'Bearer';

export interface UserInfoForAuthResponse {
  id: string;
  nickname: string;
  country: string;
  birthday: string;
  language: LanguageCode;
}
export const isUserInfoForAuthResponse = (
  obj
): obj is UserInfoForAuthResponse =>
  typeof obj?.id === 'string' &&
  typeof obj?.nickname === 'string' &&
  typeof obj?.country === 'string' &&
  typeof obj?.birthday === 'string' &&
  isLanguageCode(obj?.language);

export interface FTokenResponse {
  f: string;
  request_id: string;
  timestamp: number;
}
export const isFTokenResponse = (obj): obj is FTokenResponse =>
  typeof obj?.f === 'string' &&
  typeof obj?.request_id === 'string' &&
  typeof obj?.timestamp === 'number';

export interface AccessTokenResponse {
  accessToken: string;
  expiresIn: number;
}
export const isAccessTokenResponse = (obj): obj is AccessTokenResponse =>
  typeof obj?.accessToken === 'string' && typeof obj?.expiresIn === 'number';

export interface WebApiServerCredentialResponse {
  result: {
    webApiServerCredential: AccessTokenResponse;
  };
}
export const isWebApiServerCredentialResponse = (
  obj
): obj is WebApiServerCredentialResponse =>
  isAccessTokenResponse(obj?.result?.webApiServerCredential);

export interface WebServiceTokenResponse {
  result: AccessTokenResponse;
}
export const isWebServiceTokenResponse = (
  obj
): obj is WebServiceTokenResponse => isAccessTokenResponse(obj?.result);
