import * as os from 'os';
import { readFile, writeFile } from 'fs/promises';

import { isNsoCliSerialisedConfig, NsoCliSerialisedAccount, NsoCliSerialisedConfig } from './model/nso-cli-config.model';
import { NsoCliAccount } from './nso-cli-account.class';

export class NsoCliConfig {
  static readonly configFileName = '.nintendo-switch-online-cli-config.json';

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

  private constructor(private configPath: string) {}

  serialise(): NsoCliSerialisedConfig {
    return {
      accounts: this.accounts.map((account: NsoCliAccount) => account.serialise())
    };
  }

  async load() {
    let data;
    try {
      const json = await readFile(this.configPath, { encoding: 'utf-8' });
      data = JSON.parse(json);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.save();
      } else {
        throw 'Badly formed json in config file';
      }
    }
    if (!isNsoCliSerialisedConfig(data)) {
      throw 'Badly formed json in config file';
    }
    this.accounts = data.accounts.map((accountData: NsoCliSerialisedAccount) =>
      new NsoCliAccount(accountData.sessionToken, accountData.id, accountData.nickname));
  }

  async save() {
    try {
      const json = JSON.stringify(this.serialise(), null, 2);
      await writeFile(this.configPath, json, { encoding: 'utf-8' });
    } catch (error) {
      throw 'Error writing to config file';
    }
  }
}
