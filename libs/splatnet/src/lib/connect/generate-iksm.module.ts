import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { FTokenResult, GetIdTokenResult, SessionTokenResponse, UserInfoNeededForIksm, AccessTokenResult, NsoGameServiceCookie, NsoGameService } from './generate-iksm.model';
import { parse } from 'set-cookie-parser';
import { getNsoAppVersion } from './nso-app-version';

const userLang = 'en-GB';

// Apple Store URI
const NSO_APP_APPLE_STORE_URI = 'https://apps.apple.com/us/app/nintendo-switch-online/id1234806557';

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

// NSO service info
export const NSO_GAME_SERVICES = {
  SPLATOON_2: {
    id: 5741031244955648,
    host: 'app.splatoon2.nintendo.net',
    name: 'Splatoon 2',
    cookieName: 'iksm_session'
  } as NsoGameService,
  SUPER_SMASH_BROS_ULTIMATE: {
    id: 5598642853249024,
    host: 'app.smashbros.nintendo.net',
    name: 'Super Smash Bros. Ultimate',
    cookieName: 'super_smash_session'
  } as NsoGameService,
  ANIMAL_CROSSING_NEW_HORIZONS: {
    id: 4953919198265344,
    host: 'web.sd.lp1.acbaa.srv.nintendo.net',
    name: 'Animal Crossing: New Horizons',
    cookieName: '_gtoken'
  } as NsoGameService
};

// Imink API URI
const IMINK_API_F_ENDPOINT_URI = 'https://api.imink.app/f';

export const getIdToken = async (sessionToken: string): Promise<GetIdTokenResult> => {
  const result = await fetch(TOKEN_ENDPOINT_URI, {
    method: 'POST',
    headers: {
      'Host':            'accounts.nintendo.com',
      'Accept-Encoding': 'gzip',
      'Content-Type':    'application/json; charset=utf-8',
      'Accept-Language': userLang,
      'Content-Length':  '439',
      'Accept':          'application/json',
      'Connection':      'Keep-Alive',
      'User-Agent':      `OnlineLounge/${await getNsoAppVersion()} NASDKAPI Android`
    },
    body: JSON.stringify({
      'client_id':     NSO_APP_CLIENT_ID,
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
      'User-Agent':      `OnlineLounge/${await getNsoAppVersion()} NASDKAPI Android`,
      'Accept-Language': userLang,
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
      'token':       idToken,
      'hash_method': step
    })
  });
  const jsonObj = await result.json();
  return {
    f: jsonObj.f,
    uuid: jsonObj.request_id,
    timestamp: jsonObj.timestamp
  } as FTokenResult;
};

export const getWebApiServerCredential = async (idToken: string, fToken: FTokenResult, userInfo: UserInfoNeededForIksm): Promise<AccessTokenResult> => {
  const nsoAppVersion = await getNsoAppVersion();
  const result = await fetch(WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI, {
    method: 'POST',
    headers: {
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
    },
    body: JSON.stringify({
      parameter: {
        'f':          fToken.f,
        'naIdToken':  idToken,
        'timestamp':  fToken.timestamp,
        'requestId':  fToken.uuid,
        'naCountry':  userInfo.country,
        'naBirthday': userInfo.birthday,
        'language':   userInfo.language
      }
    })
  });
  const jsonObj = await result.json();
  // console.log(jsonObj);
  return jsonObj.result.webApiServerCredential as AccessTokenResult;
};

export const getNsoGameServiceAccessToken = async (webApiServerCredential: AccessTokenResult, fToken: FTokenResult, game: NsoGameService = NSO_GAME_SERVICES.SPLATOON_2) => {
  const nsoAppVersion = await getNsoAppVersion();
  const result = await fetch(WEB_SERVICE_TOKEN_ENDPOINT_URI, {
    method: 'POST',
    headers: {
      'Host':             'api-lp1.znc.srv.nintendo.net',
      'User-Agent':       `com.nintendo.znca/${nsoAppVersion} (Android/7.1.2)`,
      'Accept':           'application/json',
      'X-ProductVersion': nsoAppVersion,
      'Content-Type':     'application/json; charset=utf-8',
      'Connection':       'Keep-Alive',
      'Authorization':    `Bearer ${webApiServerCredential.accessToken}`,
      'Content-Length':   '37',
      'X-Platform':       'Android',
      'Accept-Encoding':  'gzip'
    },
    body: JSON.stringify({
      parameter: {
        'id':                game.id,
        'f':                 fToken.f,
        'registrationToken': webApiServerCredential.accessToken,
        'timestamp':         fToken.timestamp,
        'requestId':         fToken.uuid
      }
    })
  });
  const jsonObj = await result.json();
  // console.log(jsonObj);
  return jsonObj.result as AccessTokenResult;
};

export const getCookie = async (nsoGameServiceAccessToken: AccessTokenResult, game: NsoGameService = NSO_GAME_SERVICES.SPLATOON_2): Promise<NsoGameServiceCookie> => {
  const result = await fetch(`https://${game.host}/`, {
    method: 'GET',
    headers: {
      'Host':                    game.host,
      'X-IsAppAnalyticsOptedIn': 'false',
      'Accept':                  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding':         'gzip,deflate',
      'X-GameWebToken':          nsoGameServiceAccessToken.accessToken,
      'Accept-Language':         userLang,
      'X-IsAnalyticsOptedIn':    'false',
      'Connection':              'keep-alive',
      'DNT':                     '0',
      'User-Agent':              'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36',
      'X-Requested-With':        'com.nintendo.znca'
    }
  });
  const cookieList = parse(result.headers.get('Set-Cookie'));
  const cookie = cookieList.find(cookie => cookie.name === game.cookieName);
  if (!cookie) {
    console.log(cookieList);
    throw `Couldn't retrieve "${game.cookieName}" cookie for the cookie header`;
  }
  return {
    fullHeader: result.headers.get('Set-Cookie'),
    value: cookie.value,
    expires: +cookie.expires
  };
};
