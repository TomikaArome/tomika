export interface Splatoon3VsHistoryDetail {
  data: {
    vsHistoryDetail: Splatoon3Battle;
  };
}
export const isSplatoon3VsHistoryDetail = (obj): obj is Splatoon3VsHistoryDetail =>
  obj && typeof obj === 'object' && typeof obj.data === 'object' && isSplatoon3Battle(obj.data.vsHistoryDetail);

// TODO - split up based on latest battles or current battle
export interface Splatoon3Battle {
  id: string;
}
export const isSplatoon3Battle = (obj): obj is Splatoon3Battle =>
  obj && typeof obj === 'object' && typeof obj.id === 'string';
