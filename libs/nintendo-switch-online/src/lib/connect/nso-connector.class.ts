import * as crypto from 'crypto';
import fetch from 'node-fetch';

import {
  DEFAULT_LANGUAGE,
  NSO_APP_CLIENT_ID,
  TIME_DIFF_BEFORE_REGEN,
  TOKEN_ENDPOINT_URI,
  SESSION_TOKEN_ENDPOINT_URI,
  IMINK_API_F_ENDPOINT_URI,
  USER_INFO_ENDPOINT_URI,
  WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI,
  AUTHORIZE_URI,
  NSO_APP_REDIRECT_URI,
  SCOPES,
} from '../nso-constants';
import { LanguageCode } from '../model/language-code.model';
import {
  isNsoConnectorArgsSessionToken,
  isNsoConnectorArgsSessionTokenCode,
  NsoConnectorArgs,
} from './model/nso-connector-args.model';
import { AccessToken, IdToken, isIdToken } from './model/nso-connect.model';
import {
  FTokenResponse,
  isFTokenResponse,
  isIdTokenResponse,
  isSessionTokenResponse,
  isUserInfoForAuthResponse,
  isWebApiServerCredentialResponse,
  UserInfoForAuthResponse,
} from './model/nso-connect-response.model';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';
import { NsoApp } from '../nso-app.class';

// Utility functions
const toUrlSafeBase64Encode = (value: Buffer): string =>
  value
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const generateUrlSafeBase64String = (size): string =>
  toUrlSafeBase64Encode(crypto.randomBytes(size));

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
      state: authState,
      redirect_uri: NSO_APP_REDIRECT_URI,
      client_id: NSO_APP_CLIENT_ID,
      scope: SCOPES.join(' '),
      response_type: 'session_token_code',
      session_token_code_challenge: authCodeChallenge,
      session_token_code_challenge_method: 'S256',
      theme: 'login_form',
    });
    return `${AUTHORIZE_URI}?${params.toString()}`;
  }

  static extractSessionTokenCode(redirectUri: string): string {
    const regex = /^(.*)session_token_code=([a-zA-Z0-9\\._-]*)(&.*)?$/;
    if (!regex.test(redirectUri)) {
      throw new NsoError(
        'Redirect URI provided does not contain a session token code',
        NsoErrorCode.REDIRECT_URI_WITHOUT_SESSION_TOKEN_CODE,
        {
          provided: redirectUri,
        }
      );
    }
    return redirectUri.replace(regex, '$2');
  }

  static async get(args: NsoConnectorArgs): Promise<NsoConnector> {
    if (isNsoConnectorArgsSessionToken(args)) {
      return new NsoConnector(
        args.sessionToken,
        args.language ?? DEFAULT_LANGUAGE
      );
    }
    const nsoAppVersion = await NsoApp.get().getVersion();
    const operation = new NsoOperation(
      NsoOperationType.GET_SESSION_TOKEN,
      'Fetching session token from Nintendo connect API'
    );
    NsoApp.get().currentOperation$.next(operation);
    const sessionTokenCode = isNsoConnectorArgsSessionTokenCode(args)
      ? args.sessionTokenCode
      : NsoConnector.extractSessionTokenCode(args.redirectUri);
    const headers = {
      'User-Agent': `OnlineLounge/${nsoAppVersion} NASDKAPI Android`,
      'Accept-Language': 'en-US',
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': '540',
      Host: 'accounts.nintendo.com',
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip',
    };
    const body = {
      client_id: NSO_APP_CLIENT_ID,
      session_token_code: sessionTokenCode,
      session_token_code_verifier: args.authCodeVerifier,
    };
    let response;
    try {
      response = await fetch(SESSION_TOKEN_ENDPOINT_URI, {
        method: 'POST',
        headers,
        body: new URLSearchParams(body).toString(),
      });
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to fetch the session token',
        NsoErrorCode.SESSION_TOKEN_FETCH_FAILED,
        { headers, body, error }
      );
    }
    const obj = await response.json();
    if (!isSessionTokenResponse(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect session token response',
        NsoErrorCode.SESSION_TOKEN_FETCH_BAD_RESPONSE,
        { headers, body, response: obj }
      );
    }
    operation.complete();
    return new NsoConnector(
      obj.session_token,
      args.language ?? DEFAULT_LANGUAGE
    );
  }

  private static async getFToken(
    userAgent: string,
    token: IdToken | AccessToken
  ): Promise<FTokenResponse> {
    const hashMethod = isIdToken(token) ? 1 : 2;
    const operation = new NsoOperation(
      hashMethod === 1
        ? NsoOperationType.GET_F_TOKEN_HASH_METHOD_1
        : NsoOperationType.GET_F_TOKEN_HASH_METHOD_2,
      `Fetching f token from IMINK API using hash method ${hashMethod}`
    );
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      'User-Agent': userAgent,
      'Content-Type': 'application/json; charset=utf-8',
    };
    const body = {
      token: isIdToken(token) ? token.idToken : token.accessToken,
      hash_method: hashMethod,
    };
    let response;
    try {
      response = await fetch(IMINK_API_F_ENDPOINT_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to fetch the f token',
        NsoErrorCode.F_TOKEN_FETCH_FAILED,
        { headers, body, error }
      );
    }
    const obj = await response.json();
    if (!isFTokenResponse(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect f token response',
        NsoErrorCode.F_TOKEN_FETCH_BAD_RESPONSE,
        { headers, body, response: obj }
      );
    }
    operation.complete();
    return obj;
  }

  private idToken: IdToken;
  private userInfo: UserInfoForAuthResponse;
  private accessToken: AccessToken;

  get nintendoAccountId(): string {
    return this.userInfo?.id ?? null;
  }
  get nickname(): string {
    return this.userInfo?.nickname ?? null;
  }

  private constructor(
    public readonly sessionToken: string,
    readonly language: LanguageCode
  ) {}

  async getIdToken(): Promise<IdToken> {
    if (
      this.idToken &&
      +new Date() < this.idToken.expires - TIME_DIFF_BEFORE_REGEN
    ) {
      return this.idToken;
    }
    const nsoAppVersion = await NsoApp.get().getVersion();
    const operation = new NsoOperation(
      NsoOperationType.GET_ID_TOKEN,
      'Fetching ID token from Nintendo connect API'
    );
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      Host: 'accounts.nintendo.com',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/json; charset=utf-8',
      'Accept-Language': this.language,
      'Content-Length': '439',
      Accept: 'application/json',
      Connection: 'Keep-Alive',
      'User-Agent': `OnlineLounge/${nsoAppVersion} NASDKAPI Android`,
    };
    const body = {
      client_id: NSO_APP_CLIENT_ID,
      session_token: this.sessionToken,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token',
    };
    let response;
    try {
      response = await fetch(TOKEN_ENDPOINT_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to fetch the ID token',
        NsoErrorCode.ID_TOKEN_FETCH_FAILED,
        { headers, body, error }
      );
    }
    const obj = await response.json();
    if (!isIdTokenResponse(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect ID token response',
        NsoErrorCode.ID_TOKEN_FETCH_BAD_RESPONSE,
        { headers, body, response: obj }
      );
    }
    this.idToken = {
      scope: obj.scope,
      expires: +new Date() + obj.expires_in * 1000,
      idToken: obj.id_token,
      accessToken: obj.access_token,
      tokenType: obj.token_type,
    };
    operation.complete();
    return this.idToken;
  }

  private async getUserInfo(): Promise<UserInfoForAuthResponse> {
    const idToken = await this.getIdToken();
    const nsoAppVersion = await NsoApp.get().getVersion();
    const operation = new NsoOperation(
      NsoOperationType.GET_USER_INFO,
      'Fetching user info from Nintendo accounts API'
    );
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      'User-Agent': `OnlineLounge/${nsoAppVersion} NASDKAPI Android`,
      'Accept-Language': this.language,
      Accept: 'application/json',
      Authorization: `Bearer ${idToken.accessToken}`,
      Host: 'api.accounts.nintendo.com',
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip',
    };
    let response;
    try {
      response = await fetch(USER_INFO_ENDPOINT_URI, {
        method: 'GET',
        headers,
      });
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to fetch the user info',
        NsoErrorCode.USER_INFO_FETCH_FAILED,
        { headers, error }
      );
    }
    const obj = await response.json();
    if (!isUserInfoForAuthResponse(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect user info response',
        NsoErrorCode.USER_INFO_FETCH_BAD_RESPONSE,
        { headers, response: obj }
      );
    }
    const { id, nickname, birthday, country, language } = obj;
    this.userInfo = { id, nickname, birthday, country, language };
    operation.complete();
    return this.userInfo;
  }

  async getAccessToken(): Promise<AccessToken> {
    if (
      this.accessToken &&
      +new Date() < this.accessToken.expires - TIME_DIFF_BEFORE_REGEN
    ) {
      return this.accessToken;
    }
    const idToken = await this.getIdToken();
    const fToken = await NsoConnector.getFToken(
      NsoApp.get().userAgent,
      idToken
    );
    const userInfo = await this.getUserInfo();
    const nsoAppVersion = await NsoApp.get().getVersion();
    const operation = new NsoOperation(
      NsoOperationType.GET_WEB_API_ACCESS_TOKEN,
      'Fetching web API access token from Nintendo web API'
    );
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      Host: 'api-lp1.znc.srv.nintendo.net',
      'Accept-Language': this.language,
      'User-Agent': `com.nintendo.znca/${nsoAppVersion} (Android/7.1.2)`,
      Accept: 'application/json',
      'X-ProductVersion': nsoAppVersion,
      'Content-Type': 'application/json; charset=utf-8',
      Connection: 'Keep-Alive',
      Authorization: 'Bearer',
      'X-Platform': 'Android',
      'Accept-Encoding': 'gzip',
    };
    const body = {
      parameter: {
        f: fToken.f,
        naIdToken: idToken.idToken,
        timestamp: fToken.timestamp,
        requestId: fToken.request_id,
        naCountry: userInfo.country,
        naBirthday: userInfo.birthday,
        language: userInfo.language,
      },
    };
    let response;
    try {
      response = await fetch(WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to fetch the web api server credential',
        NsoErrorCode.WEB_API_CREDENTIAL_FETCH_FAILED,
        { headers, body, error }
      );
    }
    const obj = await response.json();
    if (!isWebApiServerCredentialResponse(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect web api server credential response',
        NsoErrorCode.WEB_API_CREDENTIAL_FETCH_BAD_RESPONSE,
        { headers, body, response: obj }
      );
    }
    this.accessToken = {
      accessToken: obj.result.webApiServerCredential.accessToken,
      expires: +new Date() + obj.result.webApiServerCredential.expiresIn * 1000,
    };
    operation.complete();
    return this.accessToken;
  }

  async getFToken(): Promise<FTokenResponse> {
    return NsoConnector.getFToken(
      NsoApp.get().userAgent,
      await this.getAccessToken()
    );
  }
}
