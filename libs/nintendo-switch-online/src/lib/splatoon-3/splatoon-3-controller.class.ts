import fetch, { Response } from 'node-fetch';

import { NsoGameConnector } from '../connect/nso-game-connector.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import { NsoApp } from '../nso-app.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';
import {
  isSplatoon3BulletToken,
  BulletToken,
} from './model/bullet-token.model';
import {
  isSplatoon3LatestBattleHistories,
  isSplatoon3LatestSalmonRunShifts,
  Splatoon3LatestBattlesHistories,
  Splatoon3LatestSalmonRunShifts,
} from './model/battle-histories.model';
import {
  isSplatoon3VsHistoryDetail,
  Splatoon3VsHistoryDetail,
} from './model/battle.model';
import { TIME_DIFF_BEFORE_REGEN } from '../nso-constants';
import {
  isSplatoon3CoopHistoryDetail,
  Splatoon3CoopHistoryDetail,
} from './model/salmon-run-shift.model';
import { Splatoon3VersionManager } from './splatoon-3-version-manager.class';
import { isSplatoon3WeaponRecords, Splatoon3WeaponRecords } from './model/index';

interface GraphqlArgs<T> {
  queryName: string;
  variables?: object;
  typeGuardFn?: (obj) => obj is T;
  operationType?: NsoOperationType;
  operationMessage?: string;
}

export class Splatoon3Controller {
  static SPLATNET_3_URI = 'https://api.lp1.av5ja.srv.nintendo.net';
  static API_BASE_URI = `${Splatoon3Controller.SPLATNET_3_URI}/api`;

  private bulletToken: BulletToken = null;
  private versionManager: Splatoon3VersionManager = new Splatoon3VersionManager();

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

  async forceSplatnetVersionUpdate() {
    await this.versionManager.fetch();
  }

  async getBulletToken(): Promise<BulletToken> {
    if (
      this.bulletToken &&
      +new Date() < this.bulletToken.expires - TIME_DIFF_BEFORE_REGEN
    ) {
      return this.bulletToken;
    }
    const accessToken = await this.nsoGameConnector.getAccessToken();
    const splatnetVersion = await this.versionManager.getVersion();
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
      Referer: 'https://api.lp1.av5ja.srv.nintendo.net',
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
      'X-Web-View-Ver': splatnetVersion,
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
    if (response.status === 403) {
      operation.fail();
      throw new NsoError(
        'This user is not registered to play Splatoon 3',
        NsoErrorCode.SPLATOON_3_SPLATNET_OUT_OF_DATE,
        { headers, versionAttempted: splatnetVersion }
      );
    }
    if (response.status >= 300) {
      operation.fail();
      throw new NsoError(
        'Incorrect Splatoon 3 bullet token response',
        NsoErrorCode.SPLATOON_3_BULLET_TOKEN_FETCH_FAILED,
        { headers, status: response.status }
      );
    }
    const obj = await response.json();
    if (!isSplatoon3BulletToken(obj)) {
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
        splatnetVersion,
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

  private async fetchGraphql(bulletToken: string, splatnetVersion: string, sha256Hash: string, variables: object = {}) {
    const headers = {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US',
      Authorization: `Bearer ${bulletToken}`,
      'Content-Type': 'application/json',
      DNT: '1',
      Origin: 'https://api.lp1.av5ja.srv.nintendo.net',
      Referer: 'https://api.lp1.av5ja.srv.nintendo.net',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
      'X-Web-View-Ver': splatnetVersion,
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
    const hash = (await this.versionManager.getGraphQlHash(args.queryName)).hash;
    const bulletToken = await this.getBulletToken();
    const splatnetVersion = await this.versionManager.getVersion();
    const operation = new NsoOperation(
      args.operationType ?? NsoOperationType.SPLATOON_3_GRAPH_QL,
      args.operationMessage ?? 'Performing graphql request on Splatoon 3 API'
    );
    NsoApp.get().currentOperation$.next(operation);
    let response: Response;
    try {
      response = await this.fetchGraphql(bulletToken.bulletToken, splatnetVersion, hash, args.variables);
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Error trying to query the Splatoon 3 graphql endpoint',
        NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_FAILED,
        { queryName: args.queryName, ...error }
      );
    }
    const obj = await response.json();
    if (args.typeGuardFn && !args.typeGuardFn(obj)) {
      operation.fail();
      throw new NsoError(
        'Incorrect Splatoon 3 graphql endpoint response',
        NsoErrorCode.SPLATOON_3_GRAPH_QL_FETCH_BAD_RESPONSE,
        { queryName: args.queryName, bulletToken: bulletToken.bulletToken, response: obj }
      );
    }
    operation.complete();
    return obj;
  }

  async fetchLatestBattles(): Promise<Splatoon3LatestBattlesHistories> {
    return await this.graphql({
      queryName: 'LatestBattleHistoriesQuery',
      typeGuardFn: isSplatoon3LatestBattleHistories,
      operationType: NsoOperationType.SPLATOON_3_LATEST_BATTLES,
      operationMessage: 'Fetching latest battles',
    });
  }

  async fetchBattle(battleId: string): Promise<Splatoon3VsHistoryDetail> {
    return await this.graphql({
      queryName: 'VsHistoryDetailQuery',
      variables: { vsResultId: battleId },
      typeGuardFn: isSplatoon3VsHistoryDetail,
      operationType: NsoOperationType.SPLATOON_3_BATTLE,
      operationMessage: `Fetching battle ${battleId}`,
    });
  }

  async fetchLatestSalmonRunShifts(): Promise<Splatoon3LatestSalmonRunShifts> {
    return await this.graphql({
      queryName: 'CoopHistoryQuery',
      typeGuardFn: isSplatoon3LatestSalmonRunShifts,
      operationType: NsoOperationType.SPLATOON_3_LATEST_SALMON_RUN_SHIFTS,
      operationMessage: 'Fetching latest salmon run shifts',
    });
  }

  async fetchSalmonRunShift(shiftId: string): Promise<Splatoon3CoopHistoryDetail> {
    return await this.graphql({
      queryName: 'CoopHistoryDetailQuery',
      variables: { coopHistoryDetailId: shiftId },
      typeGuardFn: isSplatoon3CoopHistoryDetail,
      operationType: NsoOperationType.SPLATOON_3_SALMON_RUN_SHIFT,
      operationMessage: `Fetching shift ${shiftId}`,
    });
  }

  async fetchWeaponRecords(): Promise<Splatoon3WeaponRecords> {
    return await this.graphql({
      queryName: 'WeaponRecordQuery',
      typeGuardFn: isSplatoon3WeaponRecords,
      operationType: NsoOperationType.SPLATOON_3_WEAPON_RECORDS,
      operationMessage: 'Fetching weapon records'
    });
  }
}
