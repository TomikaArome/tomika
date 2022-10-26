import fetch, { Response } from 'node-fetch';

import { NsoGameConnector } from '../connect/nso-game-connector.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import { NsoApp } from '../nso-app.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';
import {
  isSplatoon3BulletTokenRaw,
  Splatoon3BulletToken,
} from './model/bullet-token.model';
import {
  isSplatoon3LatestBattleHistoriesRaw,
  isSplatoon3LatestSalmonRunShiftsRaw,
  Splatoon3LatestBattlesHistoriesRaw,
  Splatoon3LatestSalmonRunShiftsRaw,
} from './model/battle-histories.model';
import {
  isSplatoon3VsHistoryDetailRaw,
  Splatoon3VsHistoryDetailRaw,
} from './model/battle.model';
import { TIME_DIFF_BEFORE_REGEN } from '../nso-constants';
import {
  isSplatoon3CoopHistoryDetailRaw,
  Splatoon3CoopHistoryDetailRaw,
} from './model/salmon-run-shift.model';

interface GraphqlArgs<T> {
  sha256Hash: string;
  variables?: object;
  typeGuardFn?: (obj) => obj is T;
  fetchErrorCode?: NsoErrorCode;
  fetchErrorMessage?: string;
  typeGuardErrorCode?: NsoErrorCode;
  typeGuardErrorMessage?: string;
  operationType?: NsoOperationType;
  operationMessage?: string;
}

export class Splatoon3Controller {
  private static API_BASE_URI = 'https://api.lp1.av5ja.srv.nintendo.net/api';

  private bulletToken: Splatoon3BulletToken = null;

  constructor(private nsoGameConnector: NsoGameConnector) {
    if (nsoGameConnector.game.abbr !== 'splat3') {
      throw new NsoError(
        'The nsoGameConnector provided is not setup to connect to Splatoon 2',
        NsoErrorCode.INCORRECT_GAME_PROVIDED,
        {
          game: nsoGameConnector.game,
        }
      );
    }
  }

  static equalsToUnderscore(id: string): string {
    return id.replace(/=/g, '_');
  }

  static underscoreToEquals(id: string): string {
    return id.replace(/_/g, '=');
  }

  async getBulletToken(): Promise<Splatoon3BulletToken> {
    if (
      this.bulletToken &&
      +new Date() < this.bulletToken.expires - TIME_DIFF_BEFORE_REGEN
    ) {
      return this.bulletToken;
    }
    const accessToken = await this.nsoGameConnector.getAccessToken();
    const operation = new NsoOperation(
      NsoOperationType.SPLATOON_3_BULLET_TOKEN,
      `Fetching bullet tokens from Splatoon 3 API`
    );
    NsoApp.get().currentOperation$.next(operation);
    const headers = {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US',
      'Content-Length': '0',
      'Content-Type': 'application/json',
      Dnt: '1',
      Origin: 'https://api.lp1.av5ja.srv.nintendo.net',
      Referer: 'https://api.lp1.av5ja.srv.nintendo.net/',
      'sec-ch-ua':
        '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      'X-GameWebToken': accessToken.accessToken,
      'X-NACOUNTRY': 'US',
      'X-Web-View-Ver': '1.0.0-5e2bcdfb',
    };
    let response: Response;
    try {
      response = await fetch(
        `${Splatoon3Controller.API_BASE_URI}/bullet_tokens`,
        {
          method: 'POST',
          headers,
        }
      );
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to fetch the Splatoon 3 bullet token',
        NsoErrorCode.SPLATOON_3_BULLET_TOKEN_FETCH_FAILED,
        { headers, error }
      );
    }
    if (response.status === 204) {
      operation.fail();
      throw new NsoError(
        'This user is not registered to play Splatoon 3',
        NsoErrorCode.SPLATOON_3_USER_NOT_REGISTERED,
        { headers }
      );
    }
    const obj = await response.json();
    if (!isSplatoon3BulletTokenRaw(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect Splatoon 3 bullet token response',
        NsoErrorCode.SPLATOON_3_BULLET_TOKEN_FETCH_BAD_RESPONSE,
        { headers, response: obj }
      );
    }
    let bulletTokenExpiresIn: number;
    try {
      const response = await this.fetchGraphql(
        obj.bulletToken,
        '49dd00428fb8e9b4dde62f585c8de1e0'
      );
      bulletTokenExpiresIn = +response.headers.get('x-bullettoken-remaining');
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to query the Splatoon 3 graphql endpoint',
        NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_FAILED,
        error
      );
    }
    this.bulletToken = {
      bulletToken: obj.bulletToken,
      lang: obj.lang,
      isNOECountry: obj.is_noe_country === 'true',
      expires: +new Date() + bulletTokenExpiresIn * 1000,
    };
    operation.complete();
    return this.bulletToken;
  }

  private async fetchGraphql(
    bulletToken: string,
    sha256Hash: string,
    variables = {}
  ) {
    const headers = {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US',
      Authorization: `Bearer ${bulletToken}`,
      'Content-Type': 'application/json',
      DNT: '1',
      Origin: 'https://api.lp1.av5ja.srv.nintendo.net',
      Referer: 'https://api.lp1.av5ja.srv.nintendo.net/history/latest',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
      'X-Web-View-Ver': '1.0.0-5e2bcdfb',
    };
    const body = {
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: sha256Hash,
        },
      },
      variables: variables,
    };
    try {
      return await fetch(`${Splatoon3Controller.API_BASE_URI}/graphql`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw { headers, body, error };
    }
  }

  async graphql<T>(args: GraphqlArgs<T>): Promise<T> {
    const bulletToken = await this.getBulletToken();
    const operation = new NsoOperation(
      args.operationType ?? NsoOperationType.SPLATOON_3_GRAPH_QL,
      args.operationMessage ?? 'Performing graphql request on Splatoon 3 API'
    );
    NsoApp.get().currentOperation$.next(operation);
    let response: Response;
    try {
      response = await this.fetchGraphql(
        bulletToken.bulletToken,
        args.sha256Hash,
        args.variables
      );
    } catch (error) {
      operation.fail();
      throw new NsoError(
        args.fetchErrorMessage ??
          'Error trying to query the Splatoon 3 graphql endpoint',
        args.fetchErrorCode ?? NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_FAILED,
        error
      );
    }
    const obj = await response.json();
    if (args.typeGuardFn && !args.typeGuardFn(obj)) {
      operation.fail();
      throw new NsoError(
        args.typeGuardErrorMessage ??
          'Incorrect Splatoon 3 graphql endpoint response',
        args.typeGuardErrorCode ??
          NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_BAD_RESPONSE,
        { bulletToken: bulletToken.bulletToken, response: obj }
      );
    }
    operation.complete();
    return obj;
  }

  async fetchLatestBattles(): Promise<Splatoon3LatestBattlesHistoriesRaw> {
    return await this.graphql({
      sha256Hash: '7d8b560e31617e981cf7c8aa1ca13a00',
      typeGuardFn: isSplatoon3LatestBattleHistoriesRaw,
      fetchErrorMessage: 'Error trying to fetch the latest Splatoon 3 battles',
      fetchErrorCode: NsoErrorCode.SPLATOON_3_LATEST_BATTLES_FETCH_FAILED,
      typeGuardErrorMessage: 'Incorrect Splatoon 3 latest battles response',
      typeGuardErrorCode:
        NsoErrorCode.SPLATOON_3_LATEST_BATTLES_FETCH_BAD_RESPONSE,
      operationType: NsoOperationType.SPLATOON_3_LATEST_BATTLES,
      operationMessage: 'Fetching latest battles',
    });
  }

  async fetchBattle(battleId: string): Promise<Splatoon3VsHistoryDetailRaw> {
    return await this.graphql({
      sha256Hash: 'cd82f2ade8aca7687947c5f3210805a6',
      variables: { vsResultId: battleId },
      typeGuardFn: isSplatoon3VsHistoryDetailRaw,
      fetchErrorMessage: 'Error trying to fetch a Splatoon 3 battle',
      fetchErrorCode: NsoErrorCode.SPLATOON_3_BATTLE_FETCH_FAILED,
      typeGuardErrorMessage: 'Incorrect Splatoon 3 battle response',
      typeGuardErrorCode: NsoErrorCode.SPLATOON_3_BATTLE_FETCH_BAD_RESPONSE,
      operationType: NsoOperationType.SPLATOON_3_BATTLE,
      operationMessage: `Fetching battle ${battleId}`,
    });
  }

  async fetchLatestSalmonRunShifts(): Promise<Splatoon3LatestSalmonRunShiftsRaw> {
    return await this.graphql({
      sha256Hash: '817618ce39bcf5570f52a97d73301b30',
      typeGuardFn: isSplatoon3LatestSalmonRunShiftsRaw,
      fetchErrorMessage:
        'Error trying to fetch the latest Splatoon 3 salmon run shifts',
      fetchErrorCode:
        NsoErrorCode.SPLATOON_3_LATEST_SALMON_RUN_SHIFTS_FETCH_FAILED,
      typeGuardErrorMessage: 'Incorrect Splatoon 3 latest battles response',
      typeGuardErrorCode:
        NsoErrorCode.SPLATOON_3_LATEST_SALMON_RUN_SHIFTS_FETCH_BAD_RESPONSE,
      operationType: NsoOperationType.SPLATOON_3_LATEST_SALMON_RUN_SHIFTS,
      operationMessage: 'Fetching latest salmon run shifts',
    });
  }

  async fetchSalmonRunShift(
    shiftId: string
  ): Promise<Splatoon3CoopHistoryDetailRaw> {
    return await this.graphql({
      sha256Hash: 'f3799a033f0a7ad4b1b396f9a3bafb1e',
      variables: { coopHistoryDetailId: shiftId },
      typeGuardFn: isSplatoon3CoopHistoryDetailRaw,
      fetchErrorMessage: 'Error trying to fetch a Splatoon 3 salmon run shift',
      fetchErrorCode: NsoErrorCode.SPLATOON_3_SALMON_RUN_SHIFT_FETCH_FAILED,
      typeGuardErrorMessage: 'Incorrect Splatoon 3 salmon run shift response',
      typeGuardErrorCode:
        NsoErrorCode.SPLATOON_3_SALMON_RUN_SHIFT_FETCH_BAD_RESPONSE,
      operationType: NsoOperationType.SPLATOON_3_SALMON_RUN_SHIFT,
      operationMessage: `Fetching shift ${shiftId}`,
    });
  }
}
