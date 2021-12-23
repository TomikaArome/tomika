import { GameStatus } from '../enum/game-status';
import { PlayerInfo } from './player-info.interface';

export interface LobbyInfo {
  passwordProtected: boolean;
  maxNumberOfPlayers: number;
  gameStatus: GameStatus;
  players: PlayerInfo[];
  hostId: string;
  currentRoundNumber?: number;
  totalRoundCount?: number;
}
