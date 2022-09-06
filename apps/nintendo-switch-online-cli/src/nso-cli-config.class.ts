import * as os from 'os';
import { readFile, writeFile } from 'fs/promises';

import { isNsoCliSerialisedConfig, NsoCliSerialisedAccount, NsoCliSerialisedConfig } from './model/nso-cli-config.model';
import { NsoCliAccount } from './nso-cli-account.class';
import { NsoCliError, NsoCliErrorCode } from './nso-cli-error.class';
import { NsoCli } from './nso-cli.class';
import { NsoConnector } from '@TomikaArome/nintendo-switch-online';

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
      throw new NsoCliError('JSON found within the config file badly formatted', NsoCliErrorCode.CONFIG_BADLY_FORMED_JSON, { data: json });
    }
    if (!isNsoCliSerialisedConfig(data)) {
      throw new NsoCliError('JSON found within the config file badly formatted', NsoCliErrorCode.CONFIG_BADLY_FORMED_JSON, { data: json });
    }
    this.accounts = await Promise.all(data.accounts.map(async (accountData: NsoCliSerialisedAccount) =>
      new NsoCliAccount(await NsoConnector.get({ sessionToken: accountData.sessionToken }), accountData.id, accountData.nickname)));
  }

  async save() {
    try {
      const json = JSON.stringify(this.serialise(), null, 2) + '\n';
      await writeFile(this.configPath, json, { encoding: 'utf-8' });
    } catch (error) {
      throw new NsoCliError('Failed to save the config file', NsoCliErrorCode.CONFIG_SAVE_FAILED, { error });
    }
  }
}
