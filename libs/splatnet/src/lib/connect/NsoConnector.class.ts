import fetch from 'node-fetch';
import { AccessToken, AccessTokenResponse, FTokenResponse, IdToken, IdTokenResponse, isFTokenResponse, isIdToken, isIdTokenResponse, isSessionTokenResponse, isUserInfoForAuth, isWebApiServerCredentialResponse, UserInfoForAuth } from './generate-iksm.model';
import { getNsoAppVersion } from './nso-app-version';
import { NsoError, NsoErrorCode } from '../NsoError';
import * as crypto from 'crypto';

// Nintendo connect API
const CONNECT_BASE_URI = 'https://accounts.nintendo.com/connect/1.0.0';
const AUTHORIZE_URI = `${CONNECT_BASE_URI}/authorize`;
const SESSION_TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/session_token`;
const TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/token`;
const USER_INFO_ENDPOINT_URI = 'https://api.accounts.nintendo.com/2.0.0/users/me';
const WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI = 'https://api-lp1.znc.srv.nintendo.net/v3/Account/Login';
const WEB_SERVICE_TOKEN_ENDPOINT_URI = 'https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken';

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

const userLang = 'en-GB';
const TIME_DIFF_BEFORE_REGEN = 60000;

type NsoConnectorArgsSessionToken = {
  sessionToken: string;
};
type NsoConnectorArgsSessionTokenCode = {
  sessionTokenCode: string;
  authCodeVerifier: string
};
type NsoConnectorArgsRedirectUri = {
  redirectUri: string;
  authCodeVerifier: string;
};
type NsoConnectorArgs = NsoConnectorArgsSessionToken | NsoConnectorArgsSessionTokenCode | NsoConnectorArgsRedirectUri;
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
      return new NsoConnector(args.sessionToken);
    }
    const sessionTokenCode = isNsoConnectorArgsSessionTokenCode(args) ? args.sessionTokenCode : NsoConnector.extractSessionTokenCode(args.redirectUri);
    const headers = {
      'User-Agent': `OnlineLounge/${await getNsoAppVersion()} NASDKAPI Android`,
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
    return new NsoConnector(obj.session_token);
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
  private webApiAccessToken: AccessToken;

  get nintendoAccountId(): string { return this.userInfo.id; }
  get nickname(): string { return this.userInfo.nickname; }

  private constructor(public readonly sessionToken: string) {}

  private async fetchIdToken(): Promise<void> {
    const headers = {
      'Host': 'accounts.nintendo.com',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/json; charset=utf-8',
      'Accept-Language': userLang,
      'Content-Length': '439',
      'Accept': 'application/json',
      'Connection': 'Keep-Alive',
      'User-Agent': `OnlineLounge/${await getNsoAppVersion()} NASDKAPI Android`
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
  }

  private async fetchUserInfo(): Promise<void> {
    const headers = {
      'User-Agent':      `OnlineLounge/${await getNsoAppVersion()} NASDKAPI Android`,
      'Accept-Language': userLang,
      'Accept':          'application/json',
      'Authorization':   `Bearer ${this.idToken.accessToken}`,
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
  }

  private async fetchWebApiAccessToken(fToken: FTokenResponse): Promise<void> {
    const nsoAppVersion = await getNsoAppVersion();
    const headers = {
      'Host':             'api-lp1.znc.srv.nintendo.net',
      'Accept-Language':  userLang,
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
        'naIdToken':  this.idToken.idToken,
        'timestamp':  fToken.timestamp,
        'requestId':  fToken.request_id,
        'naCountry':  this.userInfo.country,
        'naBirthday': this.userInfo.birthday,
        'language':   this.userInfo.language
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
    this.webApiAccessToken = {
      accessToken: obj.result.webApiServerCredential.accessToken,
      expires: +(new Date()) + (obj.result.webApiServerCredential.expiresIn * 1000)
    };
  }

  async getIdToken(): Promise<IdToken> {
    if (this.idToken && +new Date() < this.idToken.expires - TIME_DIFF_BEFORE_REGEN) {
      return this.idToken;
    }
    await this.fetchIdToken();
    return this.idToken;
  }

  async getWebApiAccessToken(userAgent: string): Promise<AccessToken> {
    if (this.webApiAccessToken && +new Date() < this.webApiAccessToken.expires - TIME_DIFF_BEFORE_REGEN) {
      return this.webApiAccessToken;
    }
    await this.getIdToken();
    await this.fetchUserInfo();
    await this.fetchWebApiAccessToken(await NsoConnector.getFToken(userAgent, this.idToken));
    return this.webApiAccessToken;
  }
}
