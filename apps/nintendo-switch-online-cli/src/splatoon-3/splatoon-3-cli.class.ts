import {
  NsoGameConnector,
  Splatoon3Controller,
} from '@TomikaArome/nintendo-switch-online';
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
      value: this.saveLatestBattles,
    },
    {
      name: 'Save last 50 salmon run shifts',
      value: this.saveLatestSalmonRunShifts,
    }
  ];

  async getGameInfo(): Promise<string> {
    const bulletToken = await this.controller.getBulletToken();
    return (
      (await super.getGameInfo()) +
      `
Bullet token: \u001b[90mexpires ${String(new Date(bulletToken.expires))}
    \u001b[36m${bulletToken.bulletToken}\u001b[0m`
    );
  }

  async saveLatestBattles() {
    const nsoCli = NsoCli.get();
    const battles = await this.controller.fetchLatestBattles();
    const filenames = await nsoCli.config.getFilesInDirectory(
      'splatoon-3/battles'
    );
    let newBattles = 0;
    for (const battle of battles.data.latestBattleHistories.historyGroups
      .nodes[0].historyDetails.nodes) {
      const idForFilename = Splatoon3Controller.equalsToUnderscore(battle.id);
      if (!filenames.includes(`${idForFilename}.json`)) {
        newBattles++;
        const battleData = await this.controller.fetchBattle(battle.id);
        await nsoCli.stream.wrapSpinner(
          nsoCli.config.saveJsonToFile(
            'splatoon-3/battles',
            idForFilename,
            battleData.data.vsHistoryDetail
          ),
          `Saving battle`
        );
      }
    }
    console.log('');
    console.log(
      newBattles === 0
        ? 'No new battles'
        : `Done, \u001b[1;32m${newBattles}\u001b[0m new battles were saved`
    );
    console.log(
      `\u001b[1;32m${
        filenames.length + newBattles
      }\u001b[0m total battles saved`
    );
  }

  async saveLatestSalmonRunShifts() {
    const nsoCli = NsoCli.get();
    const shifts = await this.controller.fetchLatestSalmonRunShifts();
    const filenames = await nsoCli.config.getFilesInDirectory(
      'splatoon-3/salmon-run-shifts'
    );
    let newShifts = 0;
    for (const group of shifts.data.coopResult.historyGroups.nodes) {
      for (const shift of group.historyDetails.nodes) {
        const idForFilename = Splatoon3Controller.equalsToUnderscore(shift.id);
        if (!filenames.includes(`${idForFilename}.json`)) {
          newShifts++;
          const shiftData = await this.controller.fetchSalmonRunShift(shift.id);
          await nsoCli.stream.wrapSpinner(
            nsoCli.config.saveJsonToFile(
              'splatoon-3/salmon-run-shifts',
              idForFilename,
              shiftData.data.coopHistoryDetail
            ),
            `Saving shift`
          );
        }
      }
    }

    console.log('');
    console.log(
      newShifts === 0
        ? 'No new shifts'
        : `Done, \u001b[1;32m${newShifts}\u001b[0m new shifts were saved`
    );
    console.log(
      `\u001b[1;32m${filenames.length + newShifts}\u001b[0m total shifts saved`
    );
  }
}
