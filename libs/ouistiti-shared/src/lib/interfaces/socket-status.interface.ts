import { LobbyInfo } from '@TomikaArome/ouistiti-shared';

export interface SocketStatus {
  inLobby: boolean;
  lobby?: LobbyInfo;
  playerId?: string;
}
