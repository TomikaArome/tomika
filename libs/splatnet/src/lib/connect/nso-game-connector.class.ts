import { NsoGame, NsoGameCookie } from './nso-game.model';
import { AccessToken, isWebServiceTokenResponse } from './nso-connect.model';
import { NsoConnector } from './nso-connector.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import fetch from 'node-fetch';
import { parse } from 'set-cookie-parser';
import { NsoApp } from '../nso-app.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';

const WEB_SERVICE_TOKEN_ENDPOINT_URI = 'https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken';
const TIME_DIFF_BEFORE_REGEN = 60000;

interface NsoGameConnectorArgsCookieHeader {
  game: NsoGame;
  cookieHeader: string;
}
const isNsoGameConnectorArgsCookieHeader = (obj): obj is NsoGameConnectorArgsCookieHeader => typeof obj?.cookieHeader === 'string';
interface NsoGameConnectorArgsCookieValue {
  game: NsoGame;
  cookieValue: string;
  cookieExpires: number;
}
const isNsoGameConnectorArgsCookieValue = (obj): obj is NsoGameConnectorArgsCookieValue => typeof obj?.cookieValue === 'string' && typeof obj?.cookieExpires === 'number';
interface NsoGameConnectorArgsCookie {
  game: NsoGame;
  cookie: NsoGameCookie;
}
const isNsoGameConnectorArgsCookie = (obj): obj is NsoGameConnectorArgsCookie => typeof obj?.cookie !== 'undefined';
interface NsoGameConnectorArgsNsoConnectorObj {
  game: NsoGame;
  nsoConnector: NsoConnector;
}
type NsoGameConnectorArgs = NsoGameConnectorArgsCookieHeader | NsoGameConnectorArgsCookieValue | NsoGameConnectorArgsCookie | NsoGameConnectorArgsNsoConnectorObj;

export class NsoGameConnector {
  static parseCookieHeader(cookieHeader: string, cookieName: string): NsoGameCookie {
    const cookieList = parse(cookieHeader);
    const parsedCookie = cookieList.find(cookie => cookie.name === cookieName);
    if (!parsedCookie) {
      return null;
    }
    return {
      fullHeader: cookieHeader,
      value: parsedCookie.value,
      expires: +parsedCookie.expires
    };
  }

  static async get(args: NsoGameConnectorArgs): Promise<NsoGameConnector> {
    const connector = new NsoGameConnector(args.game);
    if (isNsoGameConnectorArgsCookieHeader(args)) {
      connector._cookie = NsoGameConnector.parseCookieHeader(args.cookieHeader, args.game.cookieName);
      if (!connector._cookie) {
        throw new NsoError('Failed to parse the cookie header provided', NsoErrorCode.COOKIE_PARSE_FAILED, { cookieHeader: args.cookieHeader });
      }
    } else if (isNsoGameConnectorArgsCookieValue(args)) {
      connector._cookie = {
        fullHeader: '',
        value: args.cookieValue,
        expires: args.cookieExpires
      };
    } else if (isNsoGameConnectorArgsCookie(args)) {
      connector._cookie = args.cookie;
    } else {
      connector.nsoConnector = args.nsoConnector;
    }
    return connector;
  }

  private nsoConnector: NsoConnector = null;
  private _cookie: NsoGameCookie = null;
  private accessToken: AccessToken = null;

  private constructor(private game: NsoGame) {}

  async getAccessToken(): Promise<AccessToken> {
    if (this.accessToken && +new Date() < this.accessToken.expires - TIME_DIFF_BEFORE_REGEN) {
      return this.accessToken;
    }
    const nsoAppVersion = await NsoApp.get().getVersion();
    const webApiAccessToken = await this.nsoConnector.getAccessToken();
    const fToken = await this.nsoConnector.getFToken();
    const operation = new NsoOperation(NsoOperationType.GET_GAME_ACCESS_TOKEN, `Fetching ${this.game.name} access token from Nintendo web API`);
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      'Host':             'api-lp1.znc.srv.nintendo.net',
      'User-Agent':       `com.nintendo.znca/${nsoAppVersion} (Android/7.1.2)`,
      'Accept':           'application/json',
      'X-ProductVersion': nsoAppVersion,
      'Content-Type':     'application/json; charset=utf-8',
      'Connection':       'Keep-Alive',
      'Authorization':    `Bearer ${webApiAccessToken.accessToken}`,
      'Content-Length':   '37',
      'X-Platform':       'Android',
      'Accept-Encoding':  'gzip'
    };
    const body = {
      parameter: {
        'id':                this.game.id,
        'f':                 fToken.f,
        'registrationToken': webApiAccessToken.accessToken,
        'timestamp':         fToken.timestamp,
        'requestId':         fToken.request_id
      }
    };
    let response;
    try {
      response = await fetch(WEB_SERVICE_TOKEN_ENDPOINT_URI, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (error) {
      operation.fail();
      throw new NsoError('Error trying to fetch the game access token', NsoErrorCode.GAME_ACCESS_TOKEN_FETCH_FAILED, { headers, body, error });
    }
    const obj = await response.json();
    if (!isWebServiceTokenResponse(obj)) {
      operation.fail();
      throw new NsoError('Incorrect game access token response', NsoErrorCode.GAME_ACCESS_TOKEN_FETCH_BAD_RESPONSE, { headers, body, response: obj });
    }
    this.accessToken = {
      accessToken: obj.result.accessToken,
      expires: +(new Date()) + (obj.result.expiresIn * 1000)
    };
    operation.complete();
    return this.accessToken;
  }

  async getCookie(): Promise<NsoGameCookie> {
    if (this._cookie) {
      if (+new Date() < this._cookie.expires - TIME_DIFF_BEFORE_REGEN) {
        return this._cookie;
      } else if (!this.nsoConnector) {
        throw new NsoError(`The cookie has expired and a means of generating a new one wasn't provided`, NsoErrorCode.COOKIE_EXPIRED, { cookie: this._cookie });
      }
    }
    const accessToken = (await this.getAccessToken()).accessToken;
    const operation = new NsoOperation(NsoOperationType.GET_COOKIE, `Fetching ${this.game.name} cookie from game app headers`);
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      'Host':                    this.game.host,
      'X-IsAppAnalyticsOptedIn': 'false',
      'Accept':                  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding':         'gzip,deflate',
      'X-GameWebToken':          accessToken,
      'Accept-Language':         this.nsoConnector.language,
      'X-IsAnalyticsOptedIn':    'false',
      'Connection':              'keep-alive',
      'DNT':                     '0',
      'User-Agent':              'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36',
      'X-Requested-With':        'com.nintendo.znca'
    };
    let response;
    try {
      response = await fetch(`https://${this.game.host}/`, { method: 'GET', headers });
    } catch (error) {
      operation.fail();
      throw new NsoError('Error trying to fetch the game access token', NsoErrorCode.COOKIE_FETCH_FAILED, { headers, error });
    }
    const cookie = NsoGameConnector.parseCookieHeader(response.headers.get('Set-Cookie'), this.game.cookieName);
    if (!cookie) {
      operation.fail();
      throw new NsoError('Failed to parse the cookie from the headers', NsoErrorCode.COOKIE_PARSE_FAILED, { requestHeaders: headers, cookieHeader: response.headers.get('Set-Cookie') });
    }
    operation.complete();
    return cookie;
  }
}
