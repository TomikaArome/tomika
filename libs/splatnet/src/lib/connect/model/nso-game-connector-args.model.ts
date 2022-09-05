import { NsoConnector } from '../nso-connector.class';
import { NsoGame, NsoGameCookie } from './nso-connect.model';

export interface NsoGameConnectorArgsCookieHeader {
  game: NsoGame;
  cookieHeader: string;
}
export interface NsoGameConnectorArgsCookieValue {
  game: NsoGame;
  cookieValue: string;
  cookieExpires: number;
}
export interface NsoGameConnectorArgsCookie {
  game: NsoGame;
  cookie: NsoGameCookie;
}
export interface NsoGameConnectorArgsNsoConnectorObj {
  game: NsoGame;
  nsoConnector: NsoConnector;
}
export type NsoGameConnectorArgs = NsoGameConnectorArgsCookieHeader | NsoGameConnectorArgsCookieValue | NsoGameConnectorArgsCookie | NsoGameConnectorArgsNsoConnectorObj;

export const isNsoGameConnectorArgsCookieHeader = (obj): obj is NsoGameConnectorArgsCookieHeader => typeof obj?.cookieHeader === 'string';
export const isNsoGameConnectorArgsCookieValue = (obj): obj is NsoGameConnectorArgsCookieValue => typeof obj?.cookieValue === 'string' && typeof obj?.cookieExpires === 'number';
export const isNsoGameConnectorArgsCookie = (obj): obj is NsoGameConnectorArgsCookie => typeof obj?.cookie !== 'undefined';
