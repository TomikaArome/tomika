import { isSplatoon3UrlObject, Splatoon3UrlObject } from './url-object.model';

export interface Splatoon3WeaponRecords {
  data: {
    weaponRecords: Splatoon3WeaponRecordsNodes;
  }
}
export const isSplatoon3WeaponRecords = (obj): obj is Splatoon3WeaponRecords =>
  typeof obj === 'object' && typeof obj.data === 'object' && isSplatoon3WeaponRecordsNodes(obj.data.weaponRecords);

export interface Splatoon3WeaponRecordsNodes {
  nodes: Splatoon3WeaponRecord[];
}
export const isSplatoon3WeaponRecordsNodes = (obj): obj is Splatoon3WeaponRecordsNodes =>
  typeof obj === 'object' && obj.nodes instanceof Array && obj.nodes.reduce((acc, curr) => acc && isSplatoon3WeaponRecord(curr), true);

export interface Splatoon3WeaponRecord {
  id: string;
  image2d: Splatoon3UrlObject;
  image2dThumbnail: Splatoon3UrlObject;
  image3d: Splatoon3UrlObject;
  image3dThumbnail: Splatoon3UrlObject;
  name: string;
  specialWeapon: Splatoon3SpecialWeapon;
  stats: Splatoon3WeaponStats;
  subWeapon: Splatoon3SubWeapon;
  weaponCategory: Splatoon3WeaponCategory;
  weaponId: number;
}
export const isSplatoon3WeaponRecord = (obj): obj is Splatoon3WeaponRecord =>
  typeof obj === 'object' && typeof obj.id === 'string' && isSplatoon3UrlObject(obj.image2d) && isSplatoon3UrlObject(obj.image2dThumbnail)
  && isSplatoon3UrlObject(obj.image3d) && isSplatoon3UrlObject(obj.image3dThumbnail) && typeof obj.name === 'string' && isSplatoon3SpecialWeapon(obj.specialWeapon)
  && isSplatoon3WeaponStats(obj.stats) && isSplatoon3SubWeapon(obj.subWeapon) && isSplatoon3WeaponCategory(obj.weaponCategory) && typeof obj.weaponId === 'number';

export interface Splatoon3SpecialWeapon {
  id: string;
  image: Splatoon3UrlObject;
  name: string;
  specialWeaponId: number;
}
export const isSplatoon3SpecialWeapon = (obj): obj is Splatoon3SpecialWeapon =>
  typeof obj === 'object' && typeof obj.id === 'string' && isSplatoon3UrlObject(obj.image) && typeof obj.name === 'string'
  && typeof obj.specialWeaponId === 'number';

export interface Splatoon3SubWeapon {
  id: string;
  image: Splatoon3UrlObject;
  name: string;
  subWeaponId: number;
}
export const isSplatoon3SubWeapon = (obj): obj is Splatoon3SubWeapon =>
  typeof obj === 'object' && typeof obj.id === 'string' && isSplatoon3UrlObject(obj.image) && typeof obj.name === 'string'
  && typeof obj.subWeaponId === 'number';

export interface Splatoon3WeaponStats {
  expToLevelUp: number;
  lastUsedTime: string;
  level: number;
  paint: number;
  vibes: number;
  win: number;
}
export const isSplatoon3WeaponStats = (obj): obj is Splatoon3WeaponStats =>
  typeof obj === 'object' && typeof obj.expToLevelUp === 'number' && typeof obj.lastUsedTime === 'string' && typeof obj.level === 'number'
  && typeof obj.paint === 'number' && typeof obj.vibes === 'number' && typeof obj.win === 'number';

export interface Splatoon3WeaponCategory {
  id: string;
  weaponCategoryId: number;
}
export const isSplatoon3WeaponCategory = (obj): obj is Splatoon3WeaponCategory =>
  typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.weaponCategoryId === 'number';
