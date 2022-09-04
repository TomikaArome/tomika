export interface NsoGame {
  id: number;
  host: string;
  name: string;
  cookieName: string;
}

export interface NsoGameCookie {
  fullHeader?: string;
  value: string;
  expires: number;
}
