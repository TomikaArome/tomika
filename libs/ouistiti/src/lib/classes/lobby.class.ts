import { Player } from './player.class';
import { Game } from './game.class';
import { Socket } from 'socket.io';
import { GameStatus, LobbyCreate, LobbyInfo } from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';
import { OuistitiException } from './ouistiti-exception.class';

export class Lobby {
  id = nanoid();
  players: Player[] = [];
  game: Game;
  host: Player;
  password: string;

  maxNumberOfPlayers: number;

  static createLobbyWithNewGame(hostSocket: Socket, params: LobbyCreate): Lobby {
    OuistitiException.checkRequiredParams(params, ['host.nickname']);

    const hostPlayer = Player.createNewPlayer(hostSocket, params.host);
    const lobby = new Lobby();
    lobby.players.push(hostPlayer);
    lobby.host = hostPlayer;
    lobby.maxNumberOfPlayers = params.maxNumberOfPlayers;
    lobby.game = new Game(lobby);

    return lobby;
  }

  getPlayerFromId(playerId: string): Player {
    return this.players.find(player => player.id === playerId);
  }

  getLobbyInfo(): LobbyInfo {
    const lobbyInfo: LobbyInfo = {
      id: this.id,
      passwordProtected: !!this.password,
      gameStatus: this.game.status,
      players: this.players.map(player => player.getPlayerInfo()),
      hostId: this.host.id
    };
    if (this.game.status === GameStatus.INIT) {
      lobbyInfo.maxNumberOfPlayers = this.maxNumberOfPlayers;
    }
    if (this.game.status !== GameStatus.INIT) {
      lobbyInfo.currentRoundNumber = this.game.currentRoundNumber;
      lobbyInfo.totalRoundCount = this.game.totalRoundCount;
    }
    return lobbyInfo;
  }

  emit(eventName: string, payload: unknown) {
    this.players.forEach(player => player.emit(eventName, payload));
  }
}
