import { Player } from './player.class';
import { Game } from './game.class';
import {
  GameStatus,
  LobbyCreateParams,
  LobbyInfo,
  LobbyJoinParams,
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  OuistitiErrorType
} from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';
import { OuistitiException } from './ouistiti-exception.class';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  private lobbyClosedSource = new Subject<void>();
  lobbyClosed$ = this.lobbyClosedSource.asObservable();
  private playerJoinedSource = new Subject<Player>();
  playerJoined$ = this.playerJoinedSource.asObservable().pipe(takeUntil(this.lobbyClosed$));
  private playerLeftSource = new Subject<Player>();
  playerLeft$ = this.playerLeftSource.asObservable().pipe(takeUntil(this.lobbyClosed$));

  private static lobbies: Lobby[] = [];

  private static lobbyCreatedSource = new Subject<Lobby>();
  static lobbyCreated$ = Lobby.lobbyCreatedSource.asObservable();

  static getLobbyList(): Lobby[] {
    return Lobby.lobbies.slice();
  }

  static getLobbyById(lobbyId: string): Lobby {
    return Lobby.lobbies.find((lobby: Lobby) => lobby.id === lobbyId) ?? null;
  }

  static createLobbyWithNewGame(params: LobbyCreateParams, playerAssignFn: (player: Player) => void = () => undefined) {
    const hostPlayer = Player.createNewPlayer(params.host);
    const newLobby = new Lobby();
    newLobby.players.push(hostPlayer);
    newLobby.host = hostPlayer;
    newLobby.maxNumberOfPlayers = params.maxNumberOfPlayers ?? MAX_NUMBER_OF_PLAYERS_PER_LOBBY;
    newLobby.password = params.password;
    newLobby.game = new Game(newLobby);

    Lobby.lobbies.push(newLobby);
    playerAssignFn(hostPlayer);
    Lobby.lobbyCreatedSource.next(newLobby);
  }

  close() {
    const index = Lobby.lobbies.findIndex((lobby: Lobby) => lobby === this);
    if (index > -1) {
      Lobby.lobbies.splice(index, 1);
    }
    this.lobbyClosedSource.next();
    this.lobbyClosedSource.complete();
  }

  getPlayerById(playerId: string): Player {
    return this.players.find((player: Player) => player.id === playerId) ?? null;
  }

  addPlayer(params: LobbyJoinParams, playerAssignFn: (player: Player) => void = () => undefined): Player {
    if (this.password) {
      if (params.password !== this.password) {
        throw new OuistitiException({
          type: OuistitiErrorType.INCORRECT_PASSWORD,
          param: 'password'
        });
      }
    }

    const newPlayer = Player.createNewPlayer(params.player);
    this.players.push(newPlayer);

    playerAssignFn(newPlayer);
    this.playerJoinedSource.next(newPlayer);

    return newPlayer;
  }

  removePlayer(playerId: string) {
    const index = this.players.findIndex((player: Player) => player.id === playerId);
    if (index > -1) {
      this.playerLeftSource.next(this.players[index]);
      this.players.splice(index, 1);
    }
  }
}
