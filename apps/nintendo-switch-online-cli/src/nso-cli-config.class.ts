import * as os from 'os';
import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

import { isNsoCliSerialisedConfig, NsoCliSerialisedAccount, NsoCliSerialisedConfig } from './model/nso-cli-config.model';
import { NsoCliAccount } from './nso-cli-account.class';
import { NsoCliError, NsoCliErrorCode } from './nso-cli-error.class';
import { NsoCli } from './nso-cli.class';
import { NsoApp, NsoConnector } from '@TomikaArome/nintendo-switch-online';

export class NsoCliConfig {
  static readonly configFileName = '.nintendo-switch-online-cli-config.json';
  static readonly saveDirectoryName = 'nintendo-switch-online-cli';

  static async load(configDirPath: string = null): Promise<NsoCliConfig> {
    if (configDirPath === null) {
      configDirPath = os.homedir();
    }
    const configPath = `${configDirPath}/${NsoCliConfig.configFileName}`;
    const config = new NsoCliConfig(configPath);
    await config.load();
    return config;
  }

  accounts: NsoCliAccount[] = [];
  checkVersionOnlyOnce: boolean = undefined;
  hiddenGames: string[] = undefined;
  moreDetail: boolean = undefined;
  nsoAppVersionPrevious: string;

  private constructor(private configPath: string) {}

  async serialise(): Promise<NsoCliSerialisedConfig> {
    const serialised: NsoCliSerialisedConfig = {
      accounts: this.accounts.map((account: NsoCliAccount) => account.serialise()),
      nsoAppVersion: await NsoApp.get().getVersion()
    };
    if (this.checkVersionOnlyOnce !== undefined) { serialised.checkVersionOnlyOnce = this.checkVersionOnlyOnce; }
    if (this.hiddenGames !== undefined) { serialised.hiddenGames = this.hiddenGames; }
    if (this.moreDetail !== undefined) { serialised.moreDetail = this.moreDetail; }
    return serialised;
  }

  async deserialise(data: NsoCliSerialisedConfig) {
    if (typeof data.accounts === 'undefined') { data.accounts = []; }
    this.accounts = await Promise.all(data.accounts.map(async (accountData: NsoCliSerialisedAccount) =>
      new NsoCliAccount(await NsoConnector.get({ sessionToken: accountData.sessionToken }), accountData.id, accountData.nickname)));
    this.checkVersionOnlyOnce = data.checkVersionOnlyOnce;
    this.hiddenGames = data.hiddenGames;
    this.moreDetail = data.moreDetail;
    this.nsoAppVersionPrevious = data.nsoAppVersion;
  }

  async load() {
    let data, json;
    try {
      json = await readFile(this.configPath, { encoding: 'utf-8' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`Config file not found`);
        await NsoCli.get().stream.wrapSpinner(this.save(), `Generating config file at \u001b[36m${this.configPath}\u001b[0m`);
        return;
      } else {
        throw new NsoCliError('Failed to fetch the config file', NsoCliErrorCode.CONFIG_FETCH_FAILED, { error });
      }
    }
    try {
      data = JSON.parse(json);
    } catch (error) {
      throw new NsoCliError('JSON found within the config file badly formatted', NsoCliErrorCode.CONFIG_BADLY_FORMED_JSON, { unparsedJson: json });
    }
    if (!isNsoCliSerialisedConfig(data)) {
      throw new NsoCliError('JSON found within the config file badly formatted', NsoCliErrorCode.CONFIG_BADLY_FORMED_JSON, { parsedJson: data });
    }
    await this.deserialise(data);
  }

  async save() {
    try {
      const json = JSON.stringify(await this.serialise(), null, 2) + '\n';
      await writeFile(this.configPath, json, { encoding: 'utf-8' });
    } catch (error) {
      throw new NsoCliError('Failed to save the config file', NsoCliErrorCode.CONFIG_SAVE_FAILED, { error });
    }
  }

  async saveJsonToFile(relativeDirectory: string, extensionLessFilename: string, data: unknown) {
    const directory = `${os.homedir()}/${NsoCliConfig.saveDirectoryName}/${relativeDirectory}`;
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
    const path = `${directory}/${extensionLessFilename}.json`;
    try {
      const json = JSON.stringify(data, null, 2);
      await writeFile(path, json, { encoding: 'utf-8' });
    } catch (error) {
      console.log(error);
      throw new NsoCliError('Failed to save json data', NsoCliErrorCode.JSON_SAVE_FAILED, { path, data, error });
    }
  }
}
