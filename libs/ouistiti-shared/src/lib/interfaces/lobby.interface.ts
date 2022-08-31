import { GameStatus } from '../enum/game-status.enum';
import { PlayerCreateParams, PlayerInfo } from './player.interface';

// Client events

export interface LobbyStatus {
  inLobby: boolean;
  lobby?: LobbyInfo;
  playerId?: string;
}

export interface LobbyInfo {
  id: string;
  passwordProtected: boolean;
  gameStatus: GameStatus;
  players: PlayerInfo[];
  playerOrder: string[];
  hostId: string;
  maxNumberOfPlayers?: number;
  currentRoundNumber?: number;
  totalRoundCount?: number;
}

export interface LobbyClosed {
  id: string;
}

// Server events

export interface LobbyCreateParams {
  host: PlayerCreateParams;
  password?: string;
  maxNumberOfPlayers?: number;
}

export interface LobbyJoinParams {
  id: string;
  player: PlayerCreateParams;
  password?: string;
}

export interface LobbyUpdateParams {
  maxNumberOfPlayers?: number;
  hostId?: string;
  playerOrder?: string[];
}
