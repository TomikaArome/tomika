import fetch, { Response } from 'node-fetch';

import { NsoGameConnector } from '../connect/nso-game-connector.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import { NsoApp } from '../nso-app.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';
import { isSplatoon3BulletTokenRaw, Splatoon3BulletToken } from './model/bullet-token.model';
import { isSplatoon3LatestBattleHistoriesRaw, Splatoon3LatestBattlesHistoriesRaw } from './model/battle-histories.model';
import { isSplatoon3VsHistoryDetailRaw, Splatoon3VsHistoryDetailRaw } from './model/battle.model';
import { TIME_DIFF_BEFORE_REGEN } from '../nso-constants';

export class Splatoon3Controller {
  private static API_BASE_URI = 'https://api.lp1.av5ja.srv.nintendo.net/api';

  private bulletToken: Splatoon3BulletToken = null;

  constructor(private nsoGameConnector: NsoGameConnector) {
    if (nsoGameConnector.game.abbr !== 'splat3') {
      throw new NsoError('The nsoGameConnector provided is not setup to connect to Splatoon 2', NsoErrorCode.INCORRECT_GAME_PROVIDED, {
        game: nsoGameConnector.game
      });
    }
  }

  toFilenameSafeDate(date: string | Date): string {
    return (typeof date === 'string' ? date : date.toISOString().slice(0, 19) + date.toISOString().slice(23))
      .replace(/:/g, ';');
  }

  fromFilenameSafeDate(dateString: string): string {
    return dateString.replace(/;/g, ':');
  }

  async getBulletToken(): Promise<Splatoon3BulletToken> {
    if (this.bulletToken && +new Date() < this.bulletToken.expires - TIME_DIFF_BEFORE_REGEN) {
      return this.bulletToken;
    }
    const accessToken = await this.nsoGameConnector.getAccessToken();
    const operation = new NsoOperation(NsoOperationType.SPLATOON_3_BULLET_TOKEN, `Fetching bullet tokens from Splatoon 3 API`);
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      'Accept':             '*/*',
      'Accept-Encoding':    'gzip, deflate, br',
      'Accept-Language':    'en-US',
      'Content-Length':     '0',
      'Content-Type':       'application/json',
      'Dnt':                '1',
      'Origin':             'https://api.lp1.av5ja.srv.nintendo.net',
      'Referer':            'https://api.lp1.av5ja.srv.nintendo.net/',
      'sec-ch-ua':          '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
      'sec-ch-ua-mobile':   '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest':     'empty',
      'sec-fetch-mode':     'cors',
      'sec-fetch-site':     'same-origin',
      'User-Agent':         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      'X-GameWebToken':     accessToken.accessToken,
      'X-NACOUNTRY':        'US',
      'X-Web-View-Ver':     '1.0.0-5e2bcdfb'
    };
    let response: Response;
    try {
      response = await fetch(`${Splatoon3Controller.API_BASE_URI}/bullet_tokens`, {
        method: 'POST',
        headers
      });
    } catch (error) {
      operation.fail();
      throw new NsoError('Error trying to fetch the Splatoon 3 bullet token', NsoErrorCode.SPLATOON_3_BULLET_TOKEN_FETCH_FAILED, { headers, error });
    }
    if (response.status === 204) {
      operation.fail();
      throw new NsoError('This user is not registered to play Splatoon 3', NsoErrorCode.SPLATOON_3_USER_NOT_REGISTERED, { headers });
    }
    const obj = await response.json();
    if (!isSplatoon3BulletTokenRaw(obj)) {
      operation.fail();
      throw new NsoError('Incorrect Splatoon 3 bullet token response', NsoErrorCode.SPLATOON_3_BULLET_TOKEN_FETCH_BAD_RESPONSE, { headers, response: obj });
    }
    let bulletTokenExpiresIn: number;
    try {
      const response = await this.fetchGraphql(obj.bulletToken, '49dd00428fb8e9b4dde62f585c8de1e0');
      bulletTokenExpiresIn = +response.headers.get('x-bullettoken-remaining');
    } catch (error) {
      operation.fail();
      throw new NsoError('Error trying to query the Splatoon 3 graphql endpoint', NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_FAILED, error);
    }
    this.bulletToken = {
      bulletToken: obj.bulletToken,
      lang: obj.lang,
      isNOECountry: obj.is_noe_country === 'true',
      expires: +new Date() + bulletTokenExpiresIn * 1000
    };
    operation.complete();
    return this.bulletToken;
  }

  private async fetchGraphql(bulletToken: string, sha256Hash: string, variables = {}) {
    const headers = {
      'Accept':          '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US',
      'Authorization':   `Bearer ${bulletToken}`,
      'Content-Type':    'application/json',
      'DNT':             '1',
      'Origin':          'https://api.lp1.av5ja.srv.nintendo.net',
      'Referer':         'https://api.lp1.av5ja.srv.nintendo.net/history/latest',
      'User-Agent':      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
      'X-Web-View-Ver':  '1.0.0-5e2bcdfb'
    };
    const body = {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: sha256Hash
        }
      },
      variables: variables
    };
    try {
      return await fetch(`${Splatoon3Controller.API_BASE_URI}/graphql`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    } catch (error) {
      throw { headers, body, error };
    }
  }

  async graphql<T>(sha256Hash: string, typeGuardFn: (obj) => obj is T = null, variables = {}): Promise<T> {
    const bulletToken = await this.getBulletToken();
    const operation = new NsoOperation(NsoOperationType.SPLATOON_3_GRAPH_QL, `Performing graphql request on Splatoon 3 API`);
    NsoApp.get().currentOperation$.next(operation);
    let response: Response;
    try {
      response = await this.fetchGraphql(bulletToken.bulletToken, sha256Hash, variables);
    } catch (error) {
      operation.fail();
      throw new NsoError('Error trying to query the Splatoon 3 graphql endpoint', NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_FAILED, error);
    }
    const obj = await response.json();
    if (typeGuardFn && !typeGuardFn(obj)) {
      operation.fail();
      throw new NsoError('Incorrect Splatoon 3 graphql endpoint response', NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_BAD_RESPONSE, { bulletToken: bulletToken.bulletToken, response: obj });
    }
    operation.complete();
    return obj;
  }

  async fetchLatestBattles(): Promise<Splatoon3LatestBattlesHistoriesRaw> {
    return await this.graphql('7d8b560e31617e981cf7c8aa1ca13a00', isSplatoon3LatestBattleHistoriesRaw);
  }

  async fetchBattle(battleId: string): Promise<Splatoon3VsHistoryDetailRaw> {
    return await this.graphql('cd82f2ade8aca7687947c5f3210805a6', isSplatoon3VsHistoryDetailRaw, {
      vsResultId: battleId
    });
  }
}
