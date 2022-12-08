export interface Splatoon3BulletToken {
  bulletToken: string;
  lang: string;
  is_noe_country: string;
}
export const isSplatoon3BulletToken = (
  obj
): obj is Splatoon3BulletToken =>
  typeof obj === 'object' &&
  typeof obj.bulletToken === 'string' &&
  typeof obj.lang === 'string' &&
  typeof obj.is_noe_country === 'string';

export interface BulletToken {
  bulletToken: string;
  lang: string;
  isNOECountry: boolean;
  expires: number;
}
