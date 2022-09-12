export interface Splatoon3BulletTokenRaw {
  bulletToken: string;
  lang: string;
  is_noe_country: string;
}
export const isSplatoon3BulletTokenRaw = (obj): obj is Splatoon3BulletTokenRaw =>
  typeof obj === 'object' && typeof obj.bulletToken === 'string' && typeof obj.lang === 'string'
  && typeof obj.is_noe_country === 'string';

export interface Splatoon3BulletToken {
  bulletToken: string;
  lang: string;
  isNOECountry: boolean;
}
