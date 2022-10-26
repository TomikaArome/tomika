import { isSplatoon3BattleRaw, Splatoon3BattleRaw } from './battle.model';

export interface Splatoon3CoopHistoryDetailRaw {
  data: {
    coopHistoryDetail: Splatoon3BattleRaw;
  };
}
export const isSplatoon3CoopHistoryDetailRaw = (
  obj
): obj is Splatoon3CoopHistoryDetailRaw =>
  typeof obj === 'object' &&
  typeof obj.data === 'object' &&
  isSplatoon3BattleRaw(obj.data.coopHistoryDetail);
