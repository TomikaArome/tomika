import {
  NsoGameConnector,
  Splatoon3Controller, Splatoon3WeaponRecord
} from '@TomikaArome/nintendo-switch-online';
import { GameCli } from '../game-cli.class';
import { NsoCli } from '../nso-cli.class';
import * as Table from 'cli-table';

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
    },
    {
      name: 'List weapon freshness',
      value: this.listWeaponFreshness
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

  async listWeaponFreshness() {
    const nsoCli = NsoCli.get();

    const sorting = await nsoCli.stream.prompt({
      type: 'list',
      name: 'sorting',
      message: 'How should the list be sorted?',
      choices: [
        { name: 'Main weapon', value: 'main' },
        { name: 'Most recently used', value: 'recent' },
        { name: 'Highest freshness', value: 'freshness-desc' },
        { name: 'Lowest freshness', value: 'freshness-asc' }
      ]
    });
    const numberOfRecords = sorting === 'main' ? Infinity : await nsoCli.stream.prompt({
      type: 'number',
      name: 'numberOfRecords',
      message: 'How many weapons should be shown?',
      default: 10
    });

    const weaponsRecords = await this.controller.fetchWeaponRecords();
    const sortedAndSlicedWeaponRecords = weaponsRecords.data.weaponRecords.nodes
      .map((record: Splatoon3WeaponRecord) => {
        if (record.stats === null) {
          record.stats = {
            expToLevelUp: 10000,
            lastUsedTime: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Greenwich Mean Time)',
            level: 0,
            paint: 0,
            vibes: 0,
            win: 0
          };
        }
        return record;
      })
      .sort((a: Splatoon3WeaponRecord, b: Splatoon3WeaponRecord) => {
        switch (sorting) {
          case 'main': return a.weaponId - b.weaponId;
          case 'recent': return +new Date(b.stats.lastUsedTime) - +new Date(a.stats?.lastUsedTime);
          case 'freshness-desc': return b.stats.level === a.stats.level ? a.stats.expToLevelUp - b.stats.expToLevelUp : b.stats.level - a.stats.level;
          case 'freshness-asc': return a.stats.level === b.stats.level ? b.stats.expToLevelUp - a.stats.expToLevelUp : a.stats.level - b.stats.level;
        }
      })
    const firstWeaponIdOfEachClass = [0, 200, 300, 1000, 1100, 2000, 3000, 4000, 5000, 6000, 7010, 8000];
    const classNames = ['Shooters', 'Blasters', 'Semi-automatics', 'Rollers', 'Brushes', 'Chargers', 'Sloshers', 'Splatlings', 'Dualies', 'Brellas', 'Stringers', 'Splatanas', 'GRAND TOTAL'];
    const freshnessNeededForLevel = [0, 10000, 25000, 60000, 160000, 1160000];
    const headerColour = '\u001b[36m';
    const totalFreshnessPerClass = classNames.map(() => freshnessNeededForLevel.slice(1).map(() => 0));
    const totalWeaponsPerClass = classNames.map(() => 0);
    let classIndex = -1;
    const rows = sortedAndSlicedWeaponRecords.reduce((acc, record: Splatoon3WeaponRecord, index: number) => {
      if (firstWeaponIdOfEachClass.indexOf(record.weaponId) > -1) {
        classIndex++;
      }
      const rowColour = index % 2 === 0 ? '\u001b[37m' : '\u001b[97m';
      const totalFreshness = record.stats.level >= 5
        ? 1160000
        : freshnessNeededForLevel[record.stats.level + 1] - record.stats.expToLevelUp;
      const percentages = freshnessNeededForLevel.slice(1).map((freshnessNeeded: number, freshnessIndex: number) => {
        const minValue = Math.min(totalFreshness, freshnessNeeded);
        if (sorting === 'main') {
          totalFreshnessPerClass[classIndex][freshnessIndex] += minValue;
        }
        totalFreshnessPerClass[totalFreshnessPerClass.length - 1][freshnessIndex] += minValue;
        const percentage = Math.floor(minValue / freshnessNeeded * 100);
        const colour = percentage === 100 ? '\u001b[32m' : rowColour;
        return colour + percentage + '%';
      });
      totalWeaponsPerClass[classIndex]++;
      totalWeaponsPerClass[totalWeaponsPerClass.length - 1]++;
      if (index < numberOfRecords) {
        if (sorting === 'main' && firstWeaponIdOfEachClass.indexOf(record.weaponId) > -1) {
          acc.push([`\u001b[90m--- ${classNames[classIndex]} ---`]);
        }
        acc.push([
          rowColour + record.name,
          rowColour + record.stats.level,
          rowColour + record.stats.expToLevelUp,
          rowColour + totalFreshness,
          ...percentages
        ]);
      }
      return acc;
    }, []);
    if (sorting === 'main') {
      rows.push([`\u001b[90m--- TOTALS ---`]);
      rows.push(...totalFreshnessPerClass.map((freshnesses: number[], classIndex: number) => {
        const rowColour = classIndex % 2 === 0 ? '\u001b[37m' : '\u001b[97m';
        const percentages = freshnessNeededForLevel.slice(1).map((freshnessNeeded: number, freshnessIndex: number) => {
          const percentage = Math.floor(freshnesses[freshnessIndex] / (freshnessNeeded * totalWeaponsPerClass[classIndex]) * 100);
          const colour = percentage === 100 ? '\u001b[32m' : rowColour;
          return colour + percentage + '%';
        });
        return [rowColour + classNames[classIndex], '', '', rowColour + freshnesses[freshnesses.length - 1], ...percentages];
      }));
    }
    const headerNames = ['Name', 'Freshness', 'Next freshness', 'Total freshness', '1 star', '2 star', '3 star', '4 star', '5 star',];
    const table = new Table({
      head: headerNames.map((name: string) => headerColour + name),
      rows,
      chars: { 'top': '', 'top-mid': '', 'top-left': '', 'top-right': '', 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '', 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '', 'right': '', 'right-mid': '', 'middle': '  ' },
      style: { 'padding-left': 0, 'padding-right': 0 },
      colAligns: ['left', 'middle', 'right', 'right', 'right', 'right', 'right', 'right', 'right']
    });
    console.log('');
    console.log(table.toString())
  }
}
