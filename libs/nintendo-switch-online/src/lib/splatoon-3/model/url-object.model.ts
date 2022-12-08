export interface Splatoon3UrlObject {
  url: string;
}
export const isSplatoon3UrlObject = (obj): obj is Splatoon3UrlObject =>
  obj && typeof obj === 'object' && typeof obj.url === 'string' && /^https?:\/\//.test(obj.url);
