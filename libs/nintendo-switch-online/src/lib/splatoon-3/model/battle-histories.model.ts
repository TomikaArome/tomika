import { isSplatoon3BattleRaw, Splatoon3BattleRaw } from './battle.model';

interface Splatoon3HistoryDetailsNodesRaw {
  nodes: Splatoon3BattleRaw[];
}
const isSplatoon3HistoryDetailsNodesRaw = (obj): obj is Splatoon3HistoryDetailsNodesRaw =>
  typeof obj === 'object' && obj.nodes instanceof Array && obj.nodes.reduce((acc, curr) => acc && isSplatoon3BattleRaw(curr), true);

interface Splatoon3HistoryDetailsRaw {
  historyDetails: Splatoon3HistoryDetailsNodesRaw;
}
const isSplatoon3HistoryDetailsRaw = (obj): obj is Splatoon3HistoryDetailsRaw =>
  typeof obj === 'object' && isSplatoon3HistoryDetailsNodesRaw(obj.historyDetails);

interface Splatoon3HistoryGroupsNodesRaw {
  nodes: Splatoon3HistoryDetailsRaw[];
}
const isSplatoon3HistoryGroupsNodesRaw = (obj): obj is Splatoon3HistoryGroupsNodesRaw =>
  typeof obj === 'object' && obj.nodes instanceof Array && obj.nodes.reduce((acc, curr) => acc && isSplatoon3HistoryDetailsRaw(curr), true);

interface Splatoon3HistoryGroupsRaw {
  historyGroups: Splatoon3HistoryGroupsNodesRaw;
}
const isSplatoon3HistoryGroupsRaw = (obj): obj is Splatoon3HistoryGroupsRaw =>
  typeof obj === 'object' && isSplatoon3HistoryGroupsNodesRaw(obj.historyGroups);

export interface Splatoon3LatestBattlesHistoriesRaw {
  data: {
    latestBattleHistories: Splatoon3HistoryGroupsRaw;
  }
}
export const isSplatoon3LatestBattleHistoriesRaw = (obj): obj is Splatoon3LatestBattlesHistoriesRaw =>
  typeof obj === 'object' && typeof obj.data === 'object' && isSplatoon3HistoryGroupsRaw(obj.data.latestBattleHistories);
