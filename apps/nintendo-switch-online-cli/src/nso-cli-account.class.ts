import { isNsoGame, NsoApp, NsoConnector, NsoGame, NsoGameConnector } from '@TomikaArome/nintendo-switch-online';
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

      nsoConnector = await NsoConnector.get({
        sessionTokenCode: NsoConnector.extractSessionTokenCode(redirectUri),
        authCodeVerifier
      });
    } else {
      nsoConnector = await NsoConnector.get({ sessionToken });
    }

    await nsoConnector.getAccessToken();
    const nsoCliAccount = new NsoCliAccount(nsoConnector, nsoConnector.nintendoAccountId, nsoConnector.nickname);
    const existingNsoCliAccountIndex = nsoCli.config.accounts.findIndex((account: NsoCliAccount) => account.id === nsoCliAccount.id);
    if (existingNsoCliAccountIndex > -1) {
      console.log('Account already saved in configuration, over-writing...');
      nsoCli.config.accounts.splice(existingNsoCliAccountIndex, 1, nsoCliAccount);
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
  private gameConnectors: NsoGameConnector[] = [];

  constructor(private _nsoConnector: NsoConnector, private loadedId: string, private loadedNickname: string) {}

  serialise(): NsoCliSerialisedAccount {
    return {
      id: this.id,
      nickname: this.nickname,
      sessionToken: this.nsoConnector.sessionToken
    };
  }

  async showAccountInfo() {
    let moreDetail = '';
    if (NsoCli.get().config.moreDetail) {
      const idToken = await this.nsoConnector.getIdToken();
      const accessToken = await this.nsoConnector.getAccessToken();
      moreDetail = `
Session token:
    \u001b[36m${this.nsoConnector.sessionToken}\u001b[0m
Id token: \u001b[90mexpires ${String(new Date(idToken.expires))}
    \u001b[36m${idToken.idToken}\u001b[0m
Access token: \u001b[90mexpires ${String(new Date(accessToken.expires))}
    \u001b[36m${accessToken.accessToken}\u001b[0m`;
    }
    console.group();
    console.log(`
Nintendo account name: \u001b[36m${this.nickname}\u001b[0m
Nintendo account ID:   \u001b[36m${this.id}\u001b[0m${moreDetail}`);
    console.groupEnd();
  }

  async gamePicker() {
    const nsoCli = NsoCli.get();
    await this.showAccountInfo();
    nsoCli.stream.emptyLine();
    let continueApp = true;
    while (continueApp) {
      const gameChoices = NsoApp.games.filter((game: NsoGame) => {
        return !(nsoCli.config.hiddenGames ?? []).includes(game.abbr);
      }).map((game: NsoGame) => {
        return {
          name: game.name,
          value: game
        };
      });
      const chosenGame = await nsoCli.stream.prompt({
        type: 'list',
        name: 'game',
        message: 'Select a game or a command:',
        choices: [
          ...gameChoices,
          nsoCli.stream.separator,
          {
            name: 'Unregister account',
            value: 'unregister'
          },
          {
            name: 'Back',
            value: 'back'
          }
        ]
      });
      try {
        if (isNsoGame(chosenGame)) {
          await this.showGameInfo(chosenGame);
        } else if (chosenGame === 'unregister') {
          const accountIndex = nsoCli.config.accounts.indexOf(this);
          nsoCli.config.accounts.splice(accountIndex, 1);
          await nsoCli.stream.wrapSpinner(nsoCli.config.save(), 'Removing account from configuration');
          continueApp = false;
        } else {
          continueApp = false;
        }
      } catch (error) {
        nsoCli.stream.handleNsoError(error);
      }
      if (continueApp) { nsoCli.stream.emptyLine(); }
    }
  }

  getGameConnector(game: NsoGame): NsoGameConnector {
    const existingGameConnector = this.gameConnectors.find((gameConnector: NsoGameConnector) => gameConnector.game === game);
    if (existingGameConnector) { return existingGameConnector; }
    const newGameConnector = NsoGameConnector.get({ nsoConnector: this.nsoConnector, game });
    this.gameConnectors.push(newGameConnector);
    return newGameConnector;
  }

  async showGameInfo(game: NsoGame) {
    const gameConnector = this.getGameConnector(game);
    const cookie = await gameConnector.getCookie();
    const cookieExpires = cookie.expires ? `expires ${String(new Date(cookie.expires))}` : `expiry not available`;
    let moreDetail1 = '', moreDetail2 = '';
    if (NsoCli.get().config.moreDetail) {
      const accessToken = await gameConnector.getAccessToken();
      moreDetail1 = `
${game.name} access token: \u001b[90mexpires ${String(new Date(accessToken.expires))}
    \u001b[36m${accessToken.accessToken}\u001b[0m`;
      moreDetail2 = `
Full cookie header:
    \u001b[36m${cookie.fullHeader}\u001b[0m`;
    }
    console.group();
    console.log(`
${game.name} address:      \u001b[36mhttps://${game.host}/\u001b[0m${moreDetail1}
${game.name} ${game.cookieName} cookie: \u001b[90m${cookieExpires}
    \u001b[36m${cookie.value}\u001b[0m${moreDetail2}`);
    console.groupEnd();
  }
}
