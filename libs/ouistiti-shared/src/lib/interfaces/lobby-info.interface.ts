import { GameStatus } from '../enum/game-status.enum';
import { PlayerCreate, PlayerInfo } from './player-info.interface';

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

export interface LobbyCreate {
  host: PlayerCreate;
  password?: string;
  maxNumberOfPlayers?: number;
}

export interface LobbyUpdate {
  id: string;
  maxNumberOfPlayers?: number;
}
