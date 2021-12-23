import { PlayerColour } from '../enum/player-colour.enum';
import { PlayerSymbol } from '../enum/player-symbol.enum';

export interface PlayerInfo {
  id: string;
  nickname: string;
  colour: PlayerColour;
  symbol: PlayerSymbol;
}