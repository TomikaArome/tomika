import fetch from 'node-fetch';
import { NsoError, NsoErrorCode } from './nso-error.class';
import { NsoGame } from './connect/nso-game.model';

const NSO_APP_APPLE_STORE_URI = 'https://apps.apple.com/us/app/nintendo-switch-online/id1234806557';

export class NsoApp {
  static games: NsoGame[] = [
    {
      id: 5741031244955648,
      host: 'app.splatoon2.nintendo.net',
      name: 'Splatoon 2',
      cookieName: 'iksm_session'
    },
    {
      id: 5598642853249024,
      host: 'app.smashbros.nintendo.net',
      name: 'Super Smash Bros. Ultimate',
      cookieName: 'super_smash_session'
    },
    {
      id: 4953919198265344,
      host: 'web.sd.lp1.acbaa.srv.nintendo.net',
      name: 'Animal Crossing: New Horizons',
      cookieName: '_gtoken'
    }
  ];

  constructor(readonly userAgent: string, private _version: string = null) {
    if (this._version && !/^[0-9]+\.[0-9]+\.[0-9]+/.test(this._version)) {
      throw new NsoError('NSO app version provided badly formatted', NsoErrorCode.NSO_APP_VERSION_BADLY_FORMATTED, { provided: this._version });
    }
  }

  async getVersion(): Promise<string> {
    if (this._version) { return this._version; }
    let htmlResult;
    try {
      htmlResult = await fetch(NSO_APP_APPLE_STORE_URI, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml',
        },
      });
    } catch (error) {
      throw new NsoError('Could not fetch NSO app version', NsoErrorCode.NSO_APP_VERSION_FETCH_FAILED, { error });
    }
    const versionRegex = /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/;
    const htmlLines = (await htmlResult.text()).split(/(\r\n|\r|\n)/g);
    const lineWithVersion = htmlLines.find((htmlLine: string) => /whats-new__latest__version/.test(htmlLine));
    if (lineWithVersion && versionRegex.test(lineWithVersion)) {
      this._version = lineWithVersion.replace(versionRegex, '$2');
      return this._version;
    } else {
      throw new NsoError('Version number not found in Apple Store NSO app page', NsoErrorCode.NSO_APP_VERSION_FETCH_FAILED);
    }
  }
}
