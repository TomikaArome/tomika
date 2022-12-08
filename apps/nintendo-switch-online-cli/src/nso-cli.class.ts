import { NsoCliConfig } from './nso-cli-config.class';
import { NsoCliStream } from './nso-cli-stream.class';
import { NsoCliAccount } from './nso-cli-account.class';
import {
  NsoApp,
  NsoGame,
  NsoOperation,
} from '@TomikaArome/nintendo-switch-online';
import * as Table from 'cli-table';

export class NsoCli {
  static readonly VERSION = '1.0.0';
  static readonly USER_AGENT = `tomika-nintendo-switch-online-cli/${NsoCli.VERSION}`;

  private static instance: NsoCli;
  static get(): NsoCli {
    if (!this.instance) {
      throw `App hasn't yet been started`;
    }
    return this.instance;
  }

  static async startApp() {
    NsoCli.instance = new NsoCli();
    await NsoCli.instance.init();
  }

  config: NsoCliConfig;
  stream: NsoCliStream;
  nsoApp: NsoApp;

  private constructor() {}

  async init() {
    this.stream = new NsoCliStream();

    const openerMessageTable = new Table({
      rows: [
        [`\u001b[96m@TomikaArome`],
        [`\u001b[0;1;91mnintendo-switch-online-cli`],
        [`\u001b[0mv${NsoCli.VERSION}`]
      ],
      colAligns: ['middle'],
      chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
      style: { 'padding-left': 2, 'padding-right': 2 }
    });
    console.log('');
    console.log(openerMessageTable.toString());
    console.log('');

    const configPromise = NsoCliConfig.load();
    configPromise.catch((error) => {
      this.stream.handleNsoError(error);
      process.exit();
    });
    this.config = await NsoCli.instance.stream.wrapSpinner(
      configPromise,
      'Loading configuration'
    );
    if (this.config.checkVersionOnlyOnce && this.config.nsoAppVersionPrevious) {
      this.nsoApp = NsoApp.init({
        userAgent: NsoCli.USER_AGENT,
        version: this.config.nsoAppVersionPrevious,
      });
    } else {
      this.nsoApp = NsoApp.init({ userAgent: NsoCli.USER_AGENT });
    }
    this.nsoApp.currentOperation$.subscribe(async (operation: NsoOperation) => {
      await this.stream.wrapSpinner(operation.completed, operation.label);
    });
    this.stream.emptyLine();

    await this.accountPicker();

    console.log('Goodbye!');
    process.exit();
  }

  async accountPicker() {
    let continueApp = true;
    while (continueApp) {
      const accountChoices: unknown[] = this.config.accounts.map(
        (account: NsoCliAccount) => {
          return {
            name: `${account.nickname} \u001b[90m${account.id}\u001b[0m`,
            value: account,
          };
        }
      );
      if (accountChoices.length > 0) {
        accountChoices.push(this.stream.separator);
      }
      const chosenAccount = await this.stream.prompt({
        type: 'list',
        name: 'account',
        message: 'Select an account to use:',
        choices: [
          ...accountChoices,
          { name: 'Register new account', value: 'register' },
          { name: 'Options', value: 'options' },
          { name: 'Upgrade NSO', value: 'upgradeNso' },
          this.stream.separator,
          { name: 'Exit', value: 'exit' },
        ],
      });
      try {
        if (chosenAccount instanceof NsoCliAccount) {
          await chosenAccount.gamePicker();
        } else if (chosenAccount === 'register') {
          const account = await NsoCliAccount.register();
          await account.gamePicker();
        } else if (chosenAccount === 'options') {
          await this.options();
        } else if (chosenAccount === 'upgradeNso') {
          await this.upgradeNso();
        } else {
          continueApp = false;
        }
      } catch (error) {
        this.stream.handleNsoError(error);
      }
      if (continueApp) {
        this.stream.emptyLine();
      }
    }
  }

  async options() {
    const options = (await this.stream.prompt({
      type: 'checkbox',
      message: 'Options:',
      name: 'options',
      choices: [
        { type: 'separator', line: 'General:' },
        {
          name: 'Show more advanced account details',
          value: 'moreDetail',
          checked: !!this.config.moreDetail,
        },
        {
          name: 'Check the NSO app version on every script run',
          value: 'checkVersionMultipleTimes',
          checked: !this.config.checkVersionOnlyOnce,
        },
        { type: 'separator', line: 'Show only the following games:' },
        ...NsoApp.games.map((game: NsoGame) => {
          return {
            name: game.name,
            value: {
              optionType: 'shownGame',
              abbr: game.abbr,
            },
            checked: !(this.config.hiddenGames || []).find(
              (abbr: string) => abbr === game.abbr
            ),
          };
        }),
      ],
    })) as Array<unknown>;
    this.config.moreDetail = options.includes('moreDetail') || undefined;
    this.config.checkVersionOnlyOnce =
      !options.includes('checkVersionMultipleTimes') || undefined;
    this.config.hiddenGames = NsoApp.games
      .filter((game: NsoGame) => {
        return !options.find(
          (option: any) =>
            typeof option === 'object' &&
            option.optionType === 'shownGame' &&
            option.abbr === game.abbr
        );
      })
      .map((game: NsoGame) => game.abbr);
    if (this.config.hiddenGames.length === 0) {
      this.config.hiddenGames = undefined;
    }
    await this.stream.wrapSpinner(
      this.config.save(),
      'Saving to configuration file'
    );
  }

  async upgradeNso() {
    await this.nsoApp.getVersion(true);
    await this.stream.wrapSpinner(
      this.config.save(),
      'Saving to configuration file'
    );
  }
}
