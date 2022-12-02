import { NsoGameConnector } from '@TomikaArome/nintendo-switch-online';
import { NsoCli } from './nso-cli.class';
import { SeparatorOptions } from 'inquirer';

export class GameCli {
  constructor(protected gameConnector: NsoGameConnector) {}

  readonly showCookieInfo: boolean = true;
  readonly gameSpecificCommands: ({
    name: string;
    value: () => Promise<unknown>;
  } | SeparatorOptions)[] = [];

  async commandPicker() {
    const nsoCli = NsoCli.get();
    await this.showGameInfo();
    nsoCli.stream.emptyLine();
    let continuePicker = true;
    if (this.gameSpecificCommands.length > 0) {
      while (continuePicker) {
        const chosenCommand = await nsoCli.stream.prompt({
          type: 'list',
          name: 'command',
          message: 'Select a command',
          choices: [
            ...this.gameSpecificCommands,
            nsoCli.stream.separator,
            {
              name: 'Back',
              value: 'back',
            },
          ],
        });
        try {
          if (typeof chosenCommand === 'function') {
            await chosenCommand.call(this);
          } else {
            continuePicker = false;
          }
        } catch (error) {
          nsoCli.stream.handleNsoError(error);
        }
        if (continuePicker) {
          nsoCli.stream.emptyLine();
        }
      }
    }
  }

  async getGameInfo(): Promise<string> {
    const game = this.gameConnector.game;
    let accessTokenDetail = '',
      cookieDetail = '',
      moreDetailSpacing = '';
    if (NsoCli.get().config.moreDetail) {
      const accessToken = await this.gameConnector.getAccessToken();
      accessTokenDetail = `
${game.name} access token: \u001b[90mexpires ${String(
        new Date(accessToken.expires)
      )}
    \u001b[36m${accessToken.accessToken}\u001b[0m`;
      moreDetailSpacing = '     ';
    }
    if (this.showCookieInfo) {
      const cookie = await this.gameConnector.getCookie();
      const cookieExpires = cookie.expires
        ? `expires ${String(new Date(cookie.expires))}`
        : `expiry not available`;
      cookieDetail = `
${game.name} ${game.cookieName} cookie: \u001b[90m${cookieExpires}
    \u001b[36m${cookie.value}\u001b[0m`;
      if (NsoCli.get().config.moreDetail) {
        cookieDetail += `
Full cookie header:
    \u001b[36m${cookie.fullHeader}\u001b[0m`;
      }
    }
    return `
${game.name} address: ${moreDetailSpacing}\u001b[36mhttps://${game.host}/\u001b[0m${cookieDetail}${accessTokenDetail}`;
  }

  async showGameInfo() {
    console.group();
    console.log(await this.getGameInfo());
    console.groupEnd();
  }
}
