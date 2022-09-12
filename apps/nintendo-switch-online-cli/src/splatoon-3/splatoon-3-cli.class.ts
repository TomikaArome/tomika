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

  async saveLatestBattles() {
    const nsoCli = NsoCli.get();
    const battles = await this.controller.fetchLatestBattles();
    const filenames = await nsoCli.config.getFilesInDirectory('splatoon-3/battles');
    let newBattles = 0;
    for (const battle of battles.data.latestBattleHistories.historyGroups.nodes[0].historyDetails.nodes) {
      const idWithoutEquals = battle.id.replace(/=/, '');
      if (!filenames.includes(`${idWithoutEquals}.json`)) {
        newBattles++;
        const battleData = await this.controller.fetchBattle(battle.id);
        await nsoCli.stream.wrapSpinner(
          nsoCli.config.saveJsonToFile('splatoon-3/battles', idWithoutEquals, battleData.data.vsHistoryDetail),
          `Saving battle`
        );
      }
    }
    console.log('');
    console.log(newBattles === 0 ? 'No new battles' : `Done, \u001b[1;32m${newBattles}\u001b[0m new battles were saved`);
    console.log(`\u001b[1;32m${filenames.length + newBattles}\u001b[0m total battles saved`);
  }
}
