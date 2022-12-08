import { isSplatoon3Battle, Splatoon3Battle } from './battle.model';

interface Splatoon3HistoryDetailsNodes {
  nodes: Splatoon3Battle[];
}
const isSplatoon3HistoryDetailsNodes = (obj): obj is Splatoon3HistoryDetailsNodes =>
  obj && typeof obj === 'object' && obj.nodes instanceof Array && obj.nodes.reduce((acc, curr) => acc && isSplatoon3Battle(curr), true);

interface Splatoon3HistoryDetails {
  historyDetails: Splatoon3HistoryDetailsNodes;
}
const isSplatoon3HistoryDetails = (obj): obj is Splatoon3HistoryDetails =>
  obj && typeof obj === 'object' && isSplatoon3HistoryDetailsNodes(obj.historyDetails);

interface Splatoon3HistoryGroupsNodes {
  nodes: Splatoon3HistoryDetails[];
}
const isSplatoon3HistoryGroupsNodes = (obj): obj is Splatoon3HistoryGroupsNodes =>
  obj && typeof obj === 'object' && obj.nodes instanceof Array && obj.nodes.reduce((acc, curr) => acc && isSplatoon3HistoryDetails(curr), true);

interface Splatoon3HistoryGroups {
  historyGroups: Splatoon3HistoryGroupsNodes;
}
const isSplatoon3HistoryGroups = (obj): obj is Splatoon3HistoryGroups =>
  obj && typeof obj === 'object' && isSplatoon3HistoryGroupsNodes(obj.historyGroups);

export interface Splatoon3LatestBattlesHistories {
  data: {
    latestBattleHistories: Splatoon3HistoryGroups;
  };
}
export const isSplatoon3LatestBattleHistories = (obj): obj is Splatoon3LatestBattlesHistories =>
  obj && typeof obj === 'object' && typeof obj.data === 'object' && isSplatoon3HistoryGroups(obj.data.latestBattleHistories);

export interface Splatoon3LatestSalmonRunShifts {
  data: {
    coopResult: Splatoon3HistoryGroups;
  };
}
export const isSplatoon3LatestSalmonRunShifts = (obj): obj is Splatoon3LatestSalmonRunShifts =>
  obj && typeof obj === 'object' && typeof obj.data === 'object' && isSplatoon3HistoryGroups(obj.data.coopResult);
