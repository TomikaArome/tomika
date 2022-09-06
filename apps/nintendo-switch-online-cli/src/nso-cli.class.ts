import { NsoCliConfig } from './nso-cli-config.class';
import { NsoCliSteam } from './nso-cli-stream.class';
import { NsoCliAccount } from './nso-cli-account.class';
import { NsoApp, NsoOperation } from '@TomikaArome/nintendo-switch-online';

export class NsoCli {
  static readonly VERSION = '1.0.0'
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
  stream: NsoCliSteam;
  nsoApp: NsoApp;

  private constructor() {}

  async init() {
    this.stream = new NsoCliSteam();

    console.log(`\u001b[0;90m
┌──────────────────────────────┐
│         \u001b[0;96m@TomikaArome         \u001b[0;90m│
│  \u001b[0;1;91mnintendo-switch-online-cli  \u001b[0;90m│
│            \u001b[0mv${NsoCli.VERSION}            \u001b[0;90m│
└──────────────────────────────┘\u001b[0m
`);

    this.config = await NsoCli.instance.stream.wrapSpinner(NsoCliConfig.load(), 'Loading configuration');
    this.stream.emptyLine();

    this.nsoApp = NsoApp.init({ userAgent: NsoCli.USER_AGENT })
    this.nsoApp.currentOperation$.subscribe(async (operation: NsoOperation) => {
      await this.stream.wrapSpinner(operation.completed, operation.label);
    });

    await this.accountPicker();

    console.log('Goodbye!');
    process.exit();
  }

  async accountPicker() {
    let continueApp = true;
    while (continueApp) {
      const accountChoices: unknown[] = this.config.accounts.map((account: NsoCliAccount) => {
        return {
          name: `${account.nickname} \u001b[90m${account.id}\u001b[0m`,
          value: account
        };
      });
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
          { name: 'Exit', value: 'exit' }
        ]
      });
      this.stream.emptyLine();
      try {
        if (chosenAccount instanceof NsoCliAccount) {
          await chosenAccount.gamePicker();
        } else if (chosenAccount === 'register') {
          const account = await NsoCliAccount.register();
          await account.gamePicker();
        } else {
          continueApp = false;
        }
      } catch (error) {
        this.stream.handleNsoError(error);
      }
      if (continueApp) { this.stream.emptyLine(); }
    }
  }
}
