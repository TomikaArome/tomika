export interface NsoGameService {
  id: number;
  host: string;
  name: string;
  cookieName: string;
}

export interface GetSessionTokenResult {
  session_token: string;
  code: string;
}

export interface GetIdTokenResult {
  scope: string[];
  expires_in: number;
  id_token: string;
  access_token: string;
  token_type: 'Bearer';
}

export interface UserInfoNeededForIksm {
  nickname: string;
  country: string;
  birthday: string;
  language: 'en-US' | 'en-MX' | 'fr-CA' | 'ja-JP' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'nl-NL' | 'ru-RU';
}

export interface FTokenResult {
  f: string;
  uuid: string;
  timestamp: number;
}

export interface AccessTokenResult {
  accessToken: string;
  expiresIn: number;
}

export interface NsoGameServiceCookie {
  fullHeader?: string;
  value: string;
  expires: number;
}
