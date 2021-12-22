import { Player } from './Player.class';
import { Game } from './Game.class';
import { Socket } from 'socket.io';
import { GameStatus, LobbyInfo } from '@TomikaArome/ouistiti-shared';

export interface CreateLobbySettings {
  hostNickname: string;
  password?: string;
  maxNumberOfPlayers: 3 | 4 | 5 | 6 | 7 | 8;
}

export class Lobby {
  players: Player[] = [];
  game: Game;
  host: Player;
  password: string;

  maxNumberOfPlayers: number;

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
      passwordProtected: !!this.password,
      maxNumberOfPlayers: this.maxNumberOfPlayers,
      gameStatus: this.game.status,
      playerNicknames: this.players.map(player => player.nickname),
      hostNickname: this.host.nickname
    };
    if (this.game.status === GameStatus.IN_PROGRESS) {
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
