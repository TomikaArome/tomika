import fetch from 'node-fetch';
import { Subject } from 'rxjs';

import {
  NSO_APP_APPLE_STORE_URI,
  VERSION_CHECK_INTERVAL_DEFAULT,
} from './nso-constants';
import { NsoGame } from './connect/model/nso-connect.model';
import { NsoAppArgs } from './model/nso-app-args.model';
import { NsoError, NsoErrorCode } from './nso-error.class';
import { NsoOperation, NsoOperationType } from './nso-operation.class';

export class NsoApp {
  private static instance: NsoApp;
  static games: NsoGame[] = [
    {
      id: 5741031244955648,
      host: 'app.splatoon2.nintendo.net',
      name: 'Splatoon 2',
      cookieName: 'iksm_session',
    },
    {
      id: 5598642853249024,
      host: 'app.smashbros.nintendo.net',
      name: 'Super Smash Bros. Ultimate',
      cookieName: 'super_smash_session',
    },
    {
      id: 4953919198265344,
      host: 'web.sd.lp1.acbaa.srv.nintendo.net',
      name: 'Animal Crossing: New Horizons',
      cookieName: '_gtoken',
    },
  ];

  private lastCheckedVersion = 0;
  currentOperation$ = new Subject<NsoOperation>();

  static init(args?: NsoAppArgs): NsoApp {
    if (!NsoApp.instance) {
      NsoApp.instance = new NsoApp(
        args.userAgent,
        args.version ?? null,
        args.versionCheckInterval ?? VERSION_CHECK_INTERVAL_DEFAULT
      );
    }
    return NsoApp.instance;
  }

  static get(): NsoApp {
    if (!NsoApp.instance) {
      throw new NsoError(
        'Initiate the singleton instance of NsoApp with NsoApp.init() first',
        NsoErrorCode.NSO_APP_INSTANCE_NOT_INITIATED
      );
    }
    return NsoApp.instance;
  }

  private constructor(
    readonly userAgent: string,
    private _version: string,
    private versionCheckInterval
  ) {
    if (this._version && !/^[0-9]+\.[0-9]+\.[0-9]+/.test(this._version)) {
      throw new NsoError(
        'NSO app version provided badly formatted',
        NsoErrorCode.NSO_APP_VERSION_BADLY_FORMATTED,
        { provided: this._version }
      );
    }
  }

  async getVersion(): Promise<string> {
    if (
      this._version &&
      +new Date() < this.lastCheckedVersion + this.versionCheckInterval
    ) {
      return this._version;
    }
    const operation = new NsoOperation(
      NsoOperationType.GET_NSO_APP_VERSION,
      'Fetching version of the NSO app'
    );
    this.currentOperation$.next(operation);
    let htmlResult;
    try {
      htmlResult = await fetch(NSO_APP_APPLE_STORE_URI, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml',
        },
      });
    } catch (error) {
      operation.fail();
      throw new NsoError(
        'Could not fetch NSO app version',
        NsoErrorCode.NSO_APP_VERSION_FETCH_FAILED,
        { error }
      );
    }
    const versionRegex = /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/;
    const htmlLines = (await htmlResult.text()).split(/(\r\n|\r|\n)/g);
    const lineWithVersion = htmlLines.find((htmlLine: string) =>
      /whats-new__latest__version/.test(htmlLine)
    );
    if (lineWithVersion && versionRegex.test(lineWithVersion)) {
      this._version = lineWithVersion.replace(versionRegex, '$2');
      this.lastCheckedVersion = +new Date();
      operation.complete();
      return this._version;
    } else {
      operation.fail();
      throw new NsoError(
        'Version number not found in Apple Store NSO app page',
        NsoErrorCode.NSO_APP_VERSION_FETCH_FAILED
      );
    }
  }
}
