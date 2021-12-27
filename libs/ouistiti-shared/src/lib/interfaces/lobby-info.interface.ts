import { GameStatus } from '../enum/game-status.enum';
import { PlayerInfo } from './player-info.interface';

export interface LobbyInfo {
  id: string;
  passwordProtected: boolean;
  gameStatus: GameStatus;
  players: PlayerInfo[];
  hostId: string;
  maxNumberOfPlayers?: number;
  currentRoundNumber?: number;
  totalRoundCount?: number;
}
