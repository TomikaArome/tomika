import { GameStatus } from './GameStatus.enum';

export interface LobbyInfo {
  passwordProtected: boolean;
  maxNumberOfPlayers: number;
  gameStatus: GameStatus;
  playerNicknames: string[];
  hostNickname: string;
  currentRoundNumber?: number;
  totalRoundCount?: number;
}
