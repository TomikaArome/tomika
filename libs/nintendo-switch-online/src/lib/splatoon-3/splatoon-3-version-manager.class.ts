import { NsoApp } from '../nso-app.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';
import { NsoOperation, NsoOperationType } from '../nso-operation.class';
import { Splatoon3Controller } from './splatoon-3-controller.class';
import fetch from 'node-fetch';

interface GraphQlHash {
  name: string;
  hash: string;
  type: 'mutation' | 'query';
}

type GraphQlHashCollection = { [name: string]: GraphQlHash };

export class Splatoon3VersionManager {
  private version: string = null;
  private graphQlHashes: GraphQlHashCollection = null;

  async getVersion(): Promise<string> {
    if (!this.version) {
      await this.fetch();
    }
    return this.version;
  }

  async getGraphQlHash(name: string): Promise<GraphQlHash> {
    if (this.graphQlHashes === null) {
      await this.fetch();
    }
    if (!this.graphQlHashes[name]) {
      throw new NsoError('Splatnet 3 graphql hash not found', NsoErrorCode.SPLATOON_3_GRAPH_QL_HASH_NOT_FOUND, { provided: name, hashesAvailable: this.graphQlHashes });
    }
    return this.graphQlHashes[name];
  }

  async fetch() {
    const operation = new NsoOperation(
      NsoOperationType.SPLATOON_3_UPDATE_SPLATNET_VERSION,
      `Fetching Splatnet 3 version`
    );
    NsoApp.get().currentOperation$.next(operation);
    try {
      const mainJs = await this.fetchMainJs();
      this.version = this.parseMainJsForVersion(mainJs);
      this.graphQlHashes = this.parseMainJsForGraphQlHashes(mainJs);
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

  private async fetchMainJs(): Promise<string> {
    const mainJsPath = await this.fetchMainJsPath();
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

  private parseMainJsForGraphQlHashes(mainJs: string): GraphQlHashCollection {
    const regex = /id:\s*['"]([0-9a-f]+)['"]\s*,\s*metadata\s*:\s*{\s*}\s*,\s*name\s*:\s*['"]([a-zA-Z0-9_-]+)['"]\s*,\s*operationKind\s*:\s*['"]([a-zA-Z]+)['"]/gm;
    const matches = Array.from(mainJs.matchAll(regex));
    return matches.reduce((accumulator: GraphQlHashCollection, match: RegExpMatchArray) => {
      accumulator[match[2]] = {
        name: match[2],
        hash: match[1],
        type: match[3] as ('mutation' | 'query')
      };
      return accumulator;
    }, {});
  }
}
