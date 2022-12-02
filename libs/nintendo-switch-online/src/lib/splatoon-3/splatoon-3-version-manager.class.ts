import { NsoApp } from '../nso-app.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';
import { Splatoon3Controller } from './splatoon-3-controller.class';
import fetch from 'node-fetch';

export class Splatoon3VersionManager {
  private version: string = null;

  async getVersion(): Promise<string> {
    if (!this.version) {
      await this.fetch();
    }
    return this.version;
  }

  async fetch() {
    const operation = new NsoOperation(
      NsoOperationType.SPLATOON_3_UPDATE_SPLATNET_VERSION,
      `Fetching Splatnet 3 version`
    );
    NsoApp.get().currentOperation$.next(operation);
    try {
      const mainJsPath = await this.fetchMainJsPath();
      this.version = await this.fetchVersion(mainJsPath);
    } catch (nsoErrorDetails) {
      operation.fail();
      throw new NsoError('Could not fetch Splatnet 3 version', NsoErrorCode.SPLATOON_3_SPLATNET_VERSION_FETCH_FAILED, nsoErrorDetails);
    }
    operation.complete();
  }

  private async fetchMainJsPath(): Promise<string> {
    const html = await this.fetchSplatnetHtml();
    return this.parseHtmlForMainJsPath(html);
  }

  private async fetchSplatnetHtml(): Promise<string> {
    try {
      const htmlResult = await fetch(Splatoon3Controller.SPLATNET_3_URI, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml',
        }
      });
      return htmlResult.text();
    } catch (error) {
      throw { message: 'Failed to fetch Splatnet HTML', error };
    }
  }

  private parseHtmlForMainJsPath(html: string): string {
    const regex = /src="(\/static\/js\/main\.[0-9a-zA-Z]{8}\.js)"/;
    const match = html.match(regex);
    if (match?.length !== 2) {
      throw { message: 'main.js path not found in HTML', html };
    }
    return match[1];
  }

  private async fetchVersion(mainJsPath): Promise<string> {
    const mainJs = await this.fetchMainJs(mainJsPath);
    return this.parseMainJsForVersion(mainJs);
  }

  private async fetchMainJs(mainJsPath): Promise<string> {
    try {
      const jsResult = await fetch(Splatoon3Controller.SPLATNET_3_URI + mainJsPath, {
        method: 'GET',
        headers: {
          Accept: 'application/javascript',
        }
      });
      return jsResult.text();
    } catch (error) {
      throw { message: 'Failed to fetch main.js', error };
    }
  }

  private parseMainJsForVersion(mainJs: string): string {
    const versionRegex = /([0-9]+\.[0-9]+\.[0-9]+-)\${([a-zA-Z0-9$_]+)}/;
    const versionMatch = mainJs.match(versionRegex);
    if (versionMatch?.length !== 3) {
      throw {
        message: 'Version not found in main.js',
        mainJs: mainJs.length > 10000 ? 'Not shown due to being over 10000 characters long' : mainJs
      };
    }
    const indexOfMatch = mainJs.indexOf(versionMatch[0]);
    const hashRegex = /('|")([0-9a-f]+)('|")/;
    const hashMatch = mainJs.slice(indexOfMatch - 200, indexOfMatch).match(hashRegex);
    if (hashMatch?.length !== 4) {
      throw {
        message: 'Version hash not found in main.js',
        mainJs: mainJs.length > 10000 ? 'Not shown due to being over 10000 characters long' : mainJs
      };
    }
    return versionMatch[1] + hashMatch[2].substring(0, 8);
  }
}
