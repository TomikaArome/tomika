import { isSplatoon3Battle, Splatoon3Battle } from './battle.model';

export interface Splatoon3CoopHistoryDetail {
  data: {
    coopHistoryDetail: Splatoon3Battle;
  };
}
export const isSplatoon3CoopHistoryDetail = (
  obj
): obj is Splatoon3CoopHistoryDetail =>
  typeof obj === 'object' &&
  typeof obj.data === 'object' &&
  isSplatoon3Battle(obj.data.coopHistoryDetail);
