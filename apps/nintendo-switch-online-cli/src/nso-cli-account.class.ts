import { NsoConnector } from '@TomikaArome/nintendo-switch-online';
import { NsoCliSerialisedAccount } from './model/nso-cli-config.model';
import { NsoCli } from './nso-cli.class';

export class NsoCliAccount {
  static async register(): Promise<NsoCliAccount> {
    const nsoCli = NsoCli.get();
    const sessionToken: string = await nsoCli.stream.prompt({
      type: 'input',
      name: 'sessionToken',
      message: 'Session token (leave blank to generate a new one):',
    });

    let nsoConnector;
    if (sessionToken.length === 0) {
      const authCodeVerifier = NsoConnector.generateAuthCodeVerifier();
      const authUri = NsoConnector.generateAuthUri(authCodeVerifier);

      nsoCli.stream.emptyLine();
      console.log(`Open the following link in your browser:
\u001b[0;36m${authUri}\u001b[0m
Right click on \u001b[35mSelect this person\u001b[0m, click on \u001b[35mCopy link address\u001b[0m.`);
      nsoCli.stream.emptyLine();

      const redirectUri = await nsoCli.stream.prompt({
        type: 'input',
        name: 'redirectUri',
        message: 'Paste the copied link here:',
      });
      nsoCli.stream.emptyLine();

      nsoConnector = await NsoConnector.get({
        sessionTokenCode: NsoConnector.extractSessionTokenCode(redirectUri),
        authCodeVerifier
      });
    } else {
      nsoCli.stream.emptyLine();
      nsoConnector = await NsoConnector.get({ sessionToken });
    }

    await nsoConnector.getAccessToken();
    const nsoCliAccount = new NsoCliAccount(nsoConnector, nsoConnector.nintendoAccountId, nsoConnector.nickname);
    const existingNsoCliAccount = nsoCli.config.accounts.findIndex((account: NsoCliAccount) => account.id === nsoCliAccount.id);
    if (existingNsoCliAccount > -1) {
      console.log('Account already saved in configuration, over-writing...');
      nsoCli.config.accounts.splice(existingNsoCliAccount, 1, nsoCliAccount);
    } else {
      nsoCli.config.accounts.push(nsoCliAccount);
    }
    await nsoCli.stream.wrapSpinner(nsoCli.config.save(), 'Saving to configuration file');
    return nsoCliAccount;
  }

  get id(): string {
    return this.nsoConnector?.nintendoAccountId ?? this.loadedId;
  }
  get nickname(): string {
    return this.nsoConnector?.nickname ?? this.loadedNickname;
  }
  get nsoConnector(): NsoConnector {
    return this._nsoConnector;
  }

  constructor(private _nsoConnector: NsoConnector, private loadedId: string, private loadedNickname: string) {}

  serialise(): NsoCliSerialisedAccount {
    return {
      id: this.id,
      nickname: this.nickname,
      sessionToken: this.nsoConnector.sessionToken
    };
  }
}
