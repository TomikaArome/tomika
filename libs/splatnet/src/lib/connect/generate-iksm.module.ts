import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { FTokenResult, GetIdTokenResult, GetSessionTokenResult, UserInfoNeededForIksm, WebApiServerCredentialResult } from './generate-iksm.model';

// Apple Store URI
const NSO_APP_APPLE_STORE_URI = 'https://apps.apple.com/us/app/nintendo-switch-online/id1234806557';

// Nintendo URIs
const CONNECT_BASE_URI = 'https://accounts.nintendo.com/connect/1.0.0';
const AUTHORIZE_URI = `${CONNECT_BASE_URI}/authorize`;
const SESSION_TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/session_token`;
const TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/token`;
const USER_INFO_ENDPOINT_URI = 'https://api.accounts.nintendo.com/2.0.0/users/me';
const SPLATOON_ACCESS_TOKEN_ENDPOINT_URI = 'https://api-lp1.znc.srv.nintendo.net/v3/Account/Login';

// Splatnet 2
const SPLATNET_2_CLIENT_ID = '71b963c1b7b6d119';
const SPLATNET_2_REDIRECT_URI = `npf${SPLATNET_2_CLIENT_ID}://auth`;
const SCOPES = ['openid', 'user', 'user.birthday', 'user.mii', 'user.screenName'];

// Imink API URI
const IMINK_API_F_ENDPOINT_URI = 'https://api.imink.app/f';

// Utility functions
const toUrlSafeBase64Encode = (value: Buffer): string => value
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
const generateUrlSafeBase64String = (size = 32): string => toUrlSafeBase64Encode(crypto.randomBytes(size));

export const generateAuthCodeVerifier = (): string => generateUrlSafeBase64String(32);
export const extractSessionTokenCode = (redirectUri: string): string => redirectUri.replace(
  /^(.*)session_token_code=([a-zA-Z0-9\\._-]*)(&.*)?$/,
  '$2'
);

let splatnet2AppVersion: string = null;
export const getSplatnet2AppVersion = async (): Promise<string> => {
  if (splatnet2AppVersion) {
    return splatnet2AppVersion;
  }
  const htmlResult = await fetch(NSO_APP_APPLE_STORE_URI, {
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml',
    },
  });
  const versionRegex = /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/;
  const htmlLines = (await htmlResult.text()).split(/(?:\r\n|\r|\n)/g);
  const lineWithVersion = htmlLines.find((htmlLine: string) =>
    /whats-new__latest__version/.test(htmlLine)
  );
  if (versionRegex.test(lineWithVersion)) {
    const version = lineWithVersion.replace(
      /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/,
      '$2'
    );
    splatnet2AppVersion = version;
    return version;
  } else {
    throw 'Could not fetch NSO app version';
  }
};

export const generateAuthUri = (authCodeVerifier: string): string => {
  const authState = generateUrlSafeBase64String();
  const authCvHash = crypto.createHash('sha256');
  authCvHash.update(authCodeVerifier);
  const authCodeChallenge = toUrlSafeBase64Encode(authCvHash.digest());
  const params = new URLSearchParams({
    'state':                               authState,
    'redirect_uri':                        SPLATNET_2_REDIRECT_URI,
    'client_id':                           SPLATNET_2_CLIENT_ID,
    'scope':                               SCOPES.join(' '),
    'response_type':                       'session_token_code',
    'session_token_code_challenge':        authCodeChallenge,
    'session_token_code_challenge_method': 'S256',
    'theme':                               'login_form',
  });
  return `${AUTHORIZE_URI}?${params.toString()}`;
};

export const getSessionToken = async (sessionTokenCode: string, authCodeVerifier: string): Promise<GetSessionTokenResult> => {
  const result = await fetch(SESSION_TOKEN_ENDPOINT_URI, {
    method: 'POST',
    headers: {
      'User-Agent':      `OnlineLounge/${await getSplatnet2AppVersion()} NASDKAPI Android`,
      'Accept-Language': 'en-US',
      'Accept':          'application/json',
      'Content-Type':    'application/x-www-form-urlencoded',
      'Content-Length':  '540',
      'Host':            'accounts.nintendo.com',
      'Connection':      'Keep-Alive',
      'Accept-Encoding': 'gzip',
    },
    body: new URLSearchParams({
      'client_id':                   SPLATNET_2_CLIENT_ID,
      'session_token_code':          sessionTokenCode,
      'session_token_code_verifier': authCodeVerifier
    }).toString()
  });
  return await result.json() as GetSessionTokenResult;
};

export const getIdToken = async (sessionToken: string): Promise<GetIdTokenResult> => {
  const result = await fetch(TOKEN_ENDPOINT_URI, {
    method: 'POST',
    headers: {
      'Host':            'accounts.nintendo.com',
      'Accept-Encoding': 'gzip',
      'Content-Type':    'application/json; charset=utf-8',
      'Accept-Language': 'en-GB',
      'Content-Length':  '439',
      'Accept':          'application/json',
      'Connection':      'Keep-Alive',
      'User-Agent':      `OnlineLounge/${await getSplatnet2AppVersion()} NASDKAPI Android`
    },
    body: JSON.stringify({
      'client_id':     '71b963c1b7b6d119',
      'session_token': sessionToken,
      'grant_type':    'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token'
    })
  });
  return await result.json() as GetIdTokenResult;
};

export const getUserInfo = async (accessToken: string): Promise<UserInfoNeededForIksm> => {
  const result = await fetch(USER_INFO_ENDPOINT_URI, {
    method: 'GET',
    headers: {
      'User-Agent':      `OnlineLounge/${await getSplatnet2AppVersion()} NASDKAPI Android`,
      'Accept-Language': 'en-GB',
      'Accept':          'application/json',
      'Authorization':   `Bearer ${accessToken}`,
      'Host':            'api.accounts.nintendo.com',
      'Connection':      'Keep-Alive',
      'Accept-Encoding': 'gzip'
    }
  });
  const { nickname, birthday, country, language } = await result.json();
  return { nickname, birthday, country, language } as UserInfoNeededForIksm;
};

export const getFToken = async (userAgent: string, idToken: string, step: 1 | 2): Promise<FTokenResult> => {
  const result = await fetch(IMINK_API_F_ENDPOINT_URI, {
    method: 'POST',
    headers: {
      'User-Agent':   userAgent,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      'token':      idToken,
      'hashMethod': `${step}`
    })
  });
  const jsonObj = await result.json();
  return {
    f: jsonObj.f,
    uuid: jsonObj.request_id,
    timestamp: jsonObj.timestamp
  } as FTokenResult;
};

export const getWebApiServerCredential = async (idToken: string, fTokenResult: FTokenResult, userInfo: UserInfoNeededForIksm): Promise<WebApiServerCredentialResult> => {
  const nsoAppVersion = await getSplatnet2AppVersion();
  const result = await fetch(SPLATOON_ACCESS_TOKEN_ENDPOINT_URI, {
    method: 'POST',
    headers: {
      'Host':             'api-lp1.znc.srv.nintendo.net',
      'Accept-Language':  'en-GB',
      'User-Agent':       `com.nintendo.znca/${nsoAppVersion} (Android/7.1.2)`,
      'Accept':           'application/json',
      'X-ProductVersion': nsoAppVersion,
      'Content-Type':     'application/json; charset=utf-8',
      'Connection':       'Keep-Alive',
      'Authorization':    'Bearer',
      'X-Platform':       'Android',
      'Accept-Encoding':  'gzip'
    },
    body: JSON.stringify({
      parameter: {
        'f':          fTokenResult.f,
        'naIdToken':  idToken,
        'timestamp':  fTokenResult.timestamp,
        'requestId':  fTokenResult.uuid,
        'naCountry':  userInfo.country,
        'naBirthday': userInfo.birthday,
        'language':   userInfo.language
      }
    })
  });
  const jsonObj = await result.json();
  return jsonObj.result.webApiServerCredential as WebApiServerCredentialResult;
};
