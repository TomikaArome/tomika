import fetch from 'node-fetch';
import { AccessToken, FTokenResponse, IdToken, isFTokenResponse, isIdToken, isIdTokenResponse, isSessionTokenResponse, isUserInfoForAuth, isWebApiServerCredentialResponse, UserInfoForAuth, LanguageCode } from './nso-connect.model';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import * as crypto from 'crypto';
import { NsoApp } from '../nso-app.class';

// Nintendo connect API
const CONNECT_BASE_URI = 'https://accounts.nintendo.com/connect/1.0.0';
const AUTHORIZE_URI = `${CONNECT_BASE_URI}/authorize`;
const SESSION_TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/session_token`;
const TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/token`;
const USER_INFO_ENDPOINT_URI = 'https://api.accounts.nintendo.com/2.0.0/users/me';
const WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI = 'https://api-lp1.znc.srv.nintendo.net/v3/Account/Login';

// NSO app
const NSO_APP_CLIENT_ID = '71b963c1b7b6d119';
const NSO_APP_REDIRECT_URI = `npf${NSO_APP_CLIENT_ID}://auth`;
const SCOPES = ['openid', 'user', 'user.birthday', 'user.mii', 'user.screenName'];

// Imink API URI
const IMINK_API_F_ENDPOINT_URI = 'https://api.imink.app/f';

// Utility functions
const toUrlSafeBase64Encode = (value: Buffer): string => value
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
const generateUrlSafeBase64String = (size): string => toUrlSafeBase64Encode(crypto.randomBytes(size));

const DEFAULT_LANGUAGE = 'en-GB';
const TIME_DIFF_BEFORE_REGEN = 60000;

interface NsoConnectorArgsSessionToken {
  nsoApp: NsoApp;
  sessionToken: string;
  language?: LanguageCode;
}
interface NsoConnectorArgsSessionTokenCode {
  nsoApp: NsoApp;
  sessionTokenCode: string;
  authCodeVerifier: string;
  language?: LanguageCode;
}
interface NsoConnectorArgsRedirectUri {
  nsoApp: NsoApp;
  redirectUri: string;
  authCodeVerifier: string;
  language?: LanguageCode;
}
export type NsoConnectorArgs = NsoConnectorArgsSessionToken | NsoConnectorArgsSessionTokenCode | NsoConnectorArgsRedirectUri;
const isNsoConnectorArgsSessionToken = (obj): obj is NsoConnectorArgsSessionToken => !!obj.sessionToken;
const isNsoConnectorArgsSessionTokenCode = (obj): obj is NsoConnectorArgsSessionTokenCode => obj.sessionTokenCode && obj.authCodeVerifier;

export class NsoConnector {
  static generateAuthCodeVerifier(): string {
    return generateUrlSafeBase64String(32);
  }

  static generateAuthUri(authCodeVerifier: string): string {
    const authState = generateUrlSafeBase64String(32);
    const authCvHash = crypto.createHash('sha256');
    authCvHash.update(authCodeVerifier);
    const authCodeChallenge = toUrlSafeBase64Encode(authCvHash.digest());
    const params = new URLSearchParams({
      'state':                               authState,
      'redirect_uri':                        NSO_APP_REDIRECT_URI,
      'client_id':                           NSO_APP_CLIENT_ID,
      'scope':                               SCOPES.join(' '),
      'response_type':                       'session_token_code',
      'session_token_code_challenge':        authCodeChallenge,
      'session_token_code_challenge_method': 'S256',
      'theme':                               'login_form',
    });
    return `${AUTHORIZE_URI}?${params.toString()}`;
  }

  static extractSessionTokenCode(redirectUri: string): string {
    const regex = /^(.*)session_token_code=([a-zA-Z0-9\\._-]*)(&.*)?$/;
    if (!regex.test(redirectUri)) {
      throw new NsoError('Redirect URI provided does not contain a session token code', NsoErrorCode.REDIRECT_URI_WITHOUT_SESSION_TOKEN_CODE, {
        provided: redirectUri
      });
    }
    return redirectUri.replace(regex, '$2');
  }

  static async get(args: NsoConnectorArgs): Promise<NsoConnector> {
    if (isNsoConnectorArgsSessionToken(args)) {
      return new NsoConnector(args.sessionToken, args.nsoApp, args.language ?? DEFAULT_LANGUAGE);
    }
    const sessionTokenCode = isNsoConnectorArgsSessionTokenCode(args) ? args.sessionTokenCode : NsoConnector.extractSessionTokenCode(args.redirectUri);
    const headers = {
      'User-Agent': `OnlineLounge/${await args.nsoApp.getVersion()} NASDKAPI Android`,
      'Accept-Language': 'en-US',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': '540',
      'Host': 'accounts.nintendo.com',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',
    };
    const body = {
      'client_id': NSO_APP_CLIENT_ID,
      'session_token_code': sessionTokenCode,
      'session_token_code_verifier': args.authCodeVerifier
    };
    let response;
    try {
      response = await fetch(SESSION_TOKEN_ENDPOINT_URI, { method: 'POST', headers, body: new URLSearchParams(body).toString()
      });
    } catch (error) {
      throw new NsoError('Error trying to fetch the session token', NsoErrorCode.SESSION_TOKEN_FETCH_FAILED, { headers, body, error });
    }
    const obj = await response.json();
    if (!isSessionTokenResponse(obj)) {
      throw new NsoError('Unsuccessful session token response', NsoErrorCode.SESSION_TOKEN_FETCH_BAD_RESPONSE, { headers, body, response: obj });
    }
    return new NsoConnector(obj.session_token, args.nsoApp, args.language ?? DEFAULT_LANGUAGE);
  }

  private static async getFToken(userAgent: string, token: IdToken | AccessToken): Promise<FTokenResponse> {
    const headers = {
      'User-Agent': userAgent,
      'Content-Type': 'application/json; charset=utf-8'
    };
    const body = {
      'token': isIdToken(token) ? token.idToken : token.accessToken,
      'hash_method': isIdToken(token) ? 1 : 2
    };
    let response;
    try {
      response = await fetch(IMINK_API_F_ENDPOINT_URI, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (error) {
      throw new NsoError('Error trying to fetch the f token', NsoErrorCode.F_TOKEN_FETCH_FAILED, { headers, body, error });
    }
    const obj = await response.json();
    if (!isFTokenResponse(obj)) {
      throw new NsoError('Unsuccessful f token response', NsoErrorCode.F_TOKEN_FETCH_BAD_RESPONSE, { headers, body, response: obj });
    }
    return obj;
  }

  private idToken: IdToken;
  private userInfo: UserInfoForAuth;
  private accessToken: AccessToken;

  get nintendoAccountId(): string { return this.userInfo.id; }
  get nickname(): string { return this.userInfo.nickname; }

  private constructor(public readonly sessionToken: string, public nsoApp: NsoApp, readonly language: LanguageCode) {}

  async getIdToken(): Promise<IdToken> {
    if (this.idToken && +new Date() < this.idToken.expires - TIME_DIFF_BEFORE_REGEN) {
      return this.idToken;
    }
    const headers = {
      'Host': 'accounts.nintendo.com',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/json; charset=utf-8',
      'Accept-Language': this.language,
      'Content-Length': '439',
      'Accept': 'application/json',
      'Connection': 'Keep-Alive',
      'User-Agent': `OnlineLounge/${await this.nsoApp.getVersion()} NASDKAPI Android`
    };
    const body = {
      'client_id': NSO_APP_CLIENT_ID,
      'session_token': this.sessionToken,
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token'
    };
    let response;
    try {
      response = await fetch(TOKEN_ENDPOINT_URI, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (error) {
      throw new NsoError('Error trying to fetch the ID token', NsoErrorCode.ID_TOKEN_FETCH_FAILED, { headers, body, error });
    }
    const obj = await response.json();
    if (!isIdTokenResponse(obj)) {
      throw new NsoError('Unsuccessful ID token response', NsoErrorCode.ID_TOKEN_FETCH_BAD_RESPONSE, { headers, body, response: obj });
    }
    this.idToken = {
      scope: obj.scope,
      expires: +(new Date()) + (obj.expires_in * 1000),
      idToken: obj.id_token,
      accessToken: obj.access_token,
      tokenType: obj.token_type
    };
    return this.idToken;
  }

  private async getUserInfo(): Promise<UserInfoForAuth> {
    const idToken = await this.getIdToken();
    const headers = {
      'User-Agent':      `OnlineLounge/${await this.nsoApp.getVersion()} NASDKAPI Android`,
      'Accept-Language': this.language,
      'Accept':          'application/json',
      'Authorization':   `Bearer ${idToken.accessToken}`,
      'Host':            'api.accounts.nintendo.com',
      'Connection':      'Keep-Alive',
      'Accept-Encoding': 'gzip'
    };
    let response;
    try {
      response = await fetch(USER_INFO_ENDPOINT_URI, { method: 'GET', headers });
    } catch (error) {
      throw new NsoError('Error trying to fetch the user info', NsoErrorCode.USER_INFO_FETCH_FAILED, { headers, error });
    }
    const obj = await response.json();
    if (!isUserInfoForAuth(obj)) {
      throw new NsoError('Unsuccessful user info response', NsoErrorCode.USER_INFO_FETCH_BAD_RESPONSE, { headers, response: obj });
    }
    const { id, nickname, birthday, country, language } = obj;
    this.userInfo = { id, nickname, birthday, country, language };
    return this.userInfo;
  }

  async getAccessToken(): Promise<AccessToken> {
    if (this.accessToken && +new Date() < this.accessToken.expires - TIME_DIFF_BEFORE_REGEN) {
      return this.accessToken;
    }
    const idToken = await this.getIdToken();
    const fToken = await NsoConnector.getFToken(this.nsoApp.userAgent, idToken)
    const userInfo = await this.getUserInfo();
    const nsoAppVersion = await this.nsoApp.getVersion();
    const headers = {
      'Host':             'api-lp1.znc.srv.nintendo.net',
      'Accept-Language':  this.language,
      'User-Agent':       `com.nintendo.znca/${nsoAppVersion} (Android/7.1.2)`,
      'Accept':           'application/json',
      'X-ProductVersion': nsoAppVersion,
      'Content-Type':     'application/json; charset=utf-8',
      'Connection':       'Keep-Alive',
      'Authorization':    'Bearer',
      'X-Platform':       'Android',
      'Accept-Encoding':  'gzip'
    };
    const body = {
      parameter: {
        'f':          fToken.f,
        'naIdToken':  idToken.idToken,
        'timestamp':  fToken.timestamp,
        'requestId':  fToken.request_id,
        'naCountry':  userInfo.country,
        'naBirthday': userInfo.birthday,
        'language':   userInfo.language
      }
    };
    let response;
    try {
      response = await fetch(WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (error) {
      throw new NsoError('Error trying to fetch the web api server credential', NsoErrorCode.WEB_API_CREDENTIAL_FETCH_FAILED, { headers, body, error });
    }
    const obj = await response.json();
    if (!isWebApiServerCredentialResponse(obj)) {
      throw new NsoError('Unsuccessful web api server credential response', NsoErrorCode.WEB_API_CREDENTIAL_FETCH_BAD_RESPONSE, { headers, body, response: obj });
    }
    this.accessToken = {
      accessToken: obj.result.webApiServerCredential.accessToken,
      expires: +(new Date()) + (obj.result.webApiServerCredential.expiresIn * 1000)
    };
    return this.accessToken;
  }

  async getFToken(): Promise<FTokenResponse> {
    return NsoConnector.getFToken(this.nsoApp.userAgent, await this.getAccessToken());
  }
}
