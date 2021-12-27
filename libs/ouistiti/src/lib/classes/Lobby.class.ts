import { Player } from './Player.class';
import { Game } from './Game.class';
import { Socket } from 'socket.io';
import { GameStatus, LobbyInfo } from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';

export interface CreateLobbySettings {
  hostNickname: string;
  password?: string;
  maxNumberOfPlayers: 3 | 4 | 5 | 6 | 7 | 8;
}

export class Lobby {
  id: string;
  players: Player[] = [];
  game: Game;
  host: Player;
  password: string;

  maxNumberOfPlayers: number;

  constructor() {
    this.id = nanoid();
  }


  getPlayerFromId(playerId: string): Player {
    return this.players.find(player => player.id === playerId);
  }

  getPlayerFromSocket(socket: Socket): Player {
    return this.players.reduce((foundPlayer: Player, currentPlayer: Player) => {
      return foundPlayer || (currentPlayer.socket === socket ? currentPlayer : null);
    }, null);
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
      lobbyInfo.currentRoundNumber = this.game.currentRound.roundNumber;
      lobbyInfo.totalRoundCount = this.game.totalRoundCount;
    }
    return lobbyInfo;
  }

  static createLobbyWithNewGame(hostSocket: Socket, settings: CreateLobbySettings): Lobby {
    const lobby = new Lobby();

    const hostPlayer = new Player(hostSocket);
    hostPlayer.nickname = settings.hostNickname;
    lobby.players.push(hostPlayer);
    lobby.host = hostPlayer;

    lobby.maxNumberOfPlayers = settings.maxNumberOfPlayers;

    lobby.game = new Game(lobby);

    return lobby;
  }
}
