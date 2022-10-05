export interface Splatoon3VsHistoryDetailRaw {
  data: {
    vsHistoryDetail: Splatoon3BattleRaw;
  }
}
export const isSplatoon3VsHistoryDetailRaw = (obj): obj is Splatoon3VsHistoryDetailRaw =>
  typeof obj === 'object' && typeof obj.data === 'object' && isSplatoon3BattleRaw(obj.data.vsHistoryDetail);

// TODO - split up based on latest battles or current battle
export interface Splatoon3BattleRaw {
  id: string;
}
export const isSplatoon3BattleRaw = (obj): obj is Splatoon3BattleRaw =>
  typeof obj === 'object' && typeof obj.id === 'string';
