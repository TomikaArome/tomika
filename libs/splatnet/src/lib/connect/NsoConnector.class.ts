import fetch from 'node-fetch';
import { isSessionTokenResponse, SessionTokenResponse } from './generate-iksm.model';
import { getNsoAppVersion } from './nso-app-version';
import { NsoError, NsoErrorCode } from '../NsoError';

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
    let response;
    try {
      response = await fetch(SESSION_TOKEN_ENDPOINT_URI, {
        method: 'POST',
        headers: {
          'User-Agent': `OnlineLounge/${await getNsoAppVersion()} NASDKAPI Android`,
          'Accept-Language': 'en-US',
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': '540',
          'Host': 'accounts.nintendo.com',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
        },
        body: new URLSearchParams({
          'client_id': NSO_APP_CLIENT_ID,
          'session_token_code': sessionTokenCode,
          'session_token_code_verifier': args.authCodeVerifier
        }).toString()
      });
    } catch (error) {
      throw new NsoError('Failed when trying to fetch the session token', NsoErrorCode.SESSION_TOKEN_FETCH_FAILED, { error });
    }
    const obj = await response.json();
    if (!isSessionTokenResponse(obj)) {
      throw new NsoError('Unsuccessful session token response', NsoErrorCode.SESSION_TOKEN_FETCH_BAD_RESPONSE, obj);
    }
    return new NsoConnector(obj.session_token);
  }

  private constructor(public readonly sessionToken: string) {}
}
