import { LanguageCode } from '../../model/language-code.model';

export interface NsoConnectorArgsSessionToken {
  sessionToken: string;
  language?: LanguageCode;
}
export interface NsoConnectorArgsSessionTokenCode {
  sessionTokenCode: string;
  authCodeVerifier: string;
  language?: LanguageCode;
}
export interface NsoConnectorArgsRedirectUri {
  redirectUri: string;
  authCodeVerifier: string;
  language?: LanguageCode;
}
export type NsoConnectorArgs =
  | NsoConnectorArgsSessionToken
  | NsoConnectorArgsSessionTokenCode
  | NsoConnectorArgsRedirectUri;

export const isNsoConnectorArgsSessionToken = (
  obj
): obj is NsoConnectorArgsSessionToken => !!obj.sessionToken;
export const isNsoConnectorArgsSessionTokenCode = (
  obj
): obj is NsoConnectorArgsSessionTokenCode =>
  obj.sessionTokenCode && obj.authCodeVerifier;
