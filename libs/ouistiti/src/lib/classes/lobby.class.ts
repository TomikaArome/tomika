import { Player } from './player.class';
import { Game } from './game.class';
import { Socket } from 'socket.io';
import {
  GameStatus,
  LobbyCreate,
  LobbyInfo,
  LobbyJoin, LobbyStatus,
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  OuistitiErrorType
} from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';
import { OuistitiException } from './ouistiti-exception.class';

export class Lobby {
  id = nanoid();
  players: Player[] = [];
  game: Game;
  host: Player;
  password: string;

  maxNumberOfPlayers: number;

  get info(): LobbyInfo {
    const lobbyInfo: LobbyInfo = {
      id: this.id,
      passwordProtected: !!this.password,
      gameStatus: this.game.status,
      players: this.players.map(player => player.info),
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

  static createLobbyWithNewGame(hostSocket: Socket, params: LobbyCreate): Lobby {
    OuistitiException.checkRequiredParams(params, ['host.nickname']);

    const hostPlayer = Player.createNewPlayer(hostSocket, params.host);
    const lobby = new Lobby();
    lobby.players.push(hostPlayer);
    lobby.host = hostPlayer;
    lobby.maxNumberOfPlayers = params.maxNumberOfPlayers ?? MAX_NUMBER_OF_PLAYERS_PER_LOBBY;
    lobby.password = params.password;
    lobby.game = new Game(lobby);

    return lobby;
  }

  getPlayerFromId(playerId: string): Player {
    return this.players.find(player => player.id === playerId);
  }

  emit(eventName: string, payload: unknown) {
    this.players.forEach(player => player.emit(eventName, payload));
  }

  addPlayer(playerSocket: Socket, params: LobbyJoin): Player {
    if (this.password) {
      OuistitiException.checkRequiredParams(params, ['password']);
      if (params.password !== this.password) {
        throw new OuistitiException({
          type: OuistitiErrorType.INCORRECT_PASSWORD,
          param: 'password'
        });
      }
    }
    OuistitiException.checkRequiredParams(params, ['player.nickname']);

    const newPlayer = Player.createNewPlayer(playerSocket, params.player);
    this.players.push(newPlayer);

    this.players.forEach((player: Player) => {
      const eventPayload: LobbyStatus = {
        inLobby: true,
        lobby: this.info,
        playerId: player.id
      };
      player.emit('lobbyStatus', eventPayload);
    });

    return newPlayer;
  }
}
