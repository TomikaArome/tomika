import { PlayerColour } from '../enum/player-colour.enum';
import { PlayerSymbol } from '../enum/player-symbol.enum';

// Client events

export interface PlayerInfo {
  id: string;
  nickname: string;
  colour: PlayerColour;
  symbol: PlayerSymbol;
  vacant: boolean;
}

// Server events

export interface PlayerCreateParams {
  nickname: string;
  colour?: PlayerColour;
  symbol?: PlayerSymbol;
}

export interface PlayerUpdateParams {
  id?: string;
  nickname?: string;
  colour?: PlayerColour;
  symbol?: PlayerSymbol;
}

export interface PlayerKickParams {
  id: string;
}
