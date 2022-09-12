import { NsoGameConnector, Splatoon3Controller } from '@TomikaArome/nintendo-switch-online';
import { GameCli } from '../game-cli.class';
import { NsoCli } from '../nso-cli.class';

export class Splatoon3Cli extends GameCli {
  private controller: Splatoon3Controller;
  constructor(private nsoGameConnector: NsoGameConnector) {
    super(nsoGameConnector);
    this.controller = new Splatoon3Controller(nsoGameConnector);
  }

  readonly showCookieInfo = false;
  readonly gameSpecificCommands = [
    {
      name: 'Generate bullet tokens',
      value: this.bulletToken
    },
    {
      name: 'Save last 50 battles',
      value: this.saveLatestBattles
    }
  ];

  async getGameInfo(): Promise<string> {
    const bulletToken = await this.controller.getBulletToken();
    return (await super.getGameInfo()) + `
Bullet token: \u001b[90mexpires ${String(new Date(bulletToken.expires))}
    \u001b[36m${bulletToken.bulletToken}\u001b[0m`;
  }

  async bulletToken() {
    const response = await this.controller.getBulletToken();
    console.log(response);
  }

  async fetchLatestBattles() {
    const response = await this.controller.fetchLatestBattles();
    console.log(response);
  }

  async saveLatestBattles() {
    const nsoCli = NsoCli.get();
    const battles = await this.controller.fetchLatestBattles();
    for (const battle of battles.data.latestBattleHistories.historyGroups.nodes[0].historyDetails.nodes) {
      const battleData = await this.controller.fetchBattle(battle.id);
      console.log(`Would save \u001b[90m${battleData.data.vsHistoryDetail.id}\u001b[0m`);
      await nsoCli.stream.wrapSpinner(
        nsoCli.config.saveJsonToFile('splatoon-3/battles', battleData.data.vsHistoryDetail.id, battleData.data.vsHistoryDetail),
        `Saving battle \u001b[90m${battleData.data.vsHistoryDetail.id}\u001b[0m`);
    }
  }
}
