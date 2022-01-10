import { Player } from './player.class';
import { Game } from './game.class';
import {
  GameStatus,
  LobbyCreateParams,
  LobbyInfo,
  LobbyJoinParams,
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  MIN_NUMBER_OF_PLAYERS_PER_LOBBY,
  OuistitiErrorType, PlayerColour
} from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';
import { OuistitiException } from './ouistiti-exception.class';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  LobbyChangedHostObserved,
  LobbyJoinObserved,
  LobbyLeftObserved
} from '../interfaces/lobby-oberserved.interface';

export class Lobby {
  id = nanoid(10);
  players: Player[] = [];
  playerOrder: string[] = [];
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
      playerOrder: this.playerOrder,
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

  get playersInOrder(): Player[] {
    return this.playerOrder.map(playerId => this.getPlayerById(playerId));
  }

  private lobbyClosedSource = new Subject<void>();
  lobbyClosed$ = this.lobbyClosedSource.asObservable();
  private playerJoinedSource = new Subject<LobbyJoinObserved>();
  playerJoined$ = this.playerJoinedSource.asObservable().pipe(takeUntil(this.lobbyClosed$));
  private playerLeftSource = new Subject<LobbyLeftObserved>();
  playerLeft$ = this.playerLeftSource.asObservable().pipe(takeUntil(this.lobbyClosed$));

  private hostChangedSource = new Subject<LobbyChangedHostObserved>();
  hostChanged$ = this.hostChangedSource.asObservable();
  private playerOrderChangedSource = new Subject<string[]>();
  playerOrderChanged$ = this.playerOrderChangedSource.asObservable();
  private maximumNumberOfPlayersChangedSource = new Subject<number>();
  maximumNumberOfPlayersChanged$ = this.maximumNumberOfPlayersChangedSource.asObservable();

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
    newLobby.playerOrder.push(hostPlayer.id);
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
  getPlayerByIdAndThrowIfNotFound(playerId: string, param = 'id'): Player {
    const player = this.getPlayerById(playerId);
    if (!player) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ID,
        detail: {
          provided: playerId
        },
        param
      });
    }
    return player;
  }

  nicknameTaken(nickname: string): boolean {
    return this.players.findIndex((player: Player) => player.nickname === nickname) > -1;
  }

  colourTaken(colour: PlayerColour): boolean {
    return this.players.findIndex((player: Player) => player.colour === colour) > -1;
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

    if (!params.player.colour || this.colourTaken(params.player.colour)) {
      const remainingColours: PlayerColour[] = Object.values(PlayerColour).filter((colour: PlayerColour) => !this.colourTaken(colour));
      params.player.colour = remainingColours[Math.floor(Math.random() * remainingColours.length)];
    }

    const newPlayer = Player.createNewPlayer(params.player);
    this.players.push(newPlayer);
    this.playerOrder.push(newPlayer.id);

    playerAssignFn(newPlayer);
    const observed: LobbyJoinObserved = {
      player: newPlayer,
      order: this.playerOrder
    }
    this.playerJoinedSource.next(observed);

    return newPlayer;
  }

  removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
    this.playerOrder.splice(this.playerOrder.indexOf(player.id), 1);
    if (this.players.length > 0) {
      const observed: LobbyLeftObserved = {
        player,
        order: this.playerOrder
      };
      if (player === this.host) {
        this.host = this.players[0];
        observed.newHost = this.host;
      }
      this.playerLeftSource.next(observed);
    } else {
      this.close();
    }
  }

  changeHost(newHostId: string) {
    const newHost = this.getPlayerByIdAndThrowIfNotFound(newHostId, 'hostId');

    const previousHost = this.host;
    this.host = newHost;
    this.hostChangedSource.next({ previousHost, newHost });
  }

  changeOrder(newOrder: string[]) {
    const missingPlayers: string[] = this.players.reduce((missing: string[], currentPlayer: Player) => {
      if (newOrder.indexOf(currentPlayer.id) === -1) {
        missing.push(currentPlayer.id);
      }
      return missing;
    }, []);
    if (missingPlayers.length > 0) {
      throw new OuistitiException({
        type: OuistitiErrorType.ORDER_ARRAY_INCOMPLETE,
        detail: {
          provided: newOrder,
          missing: missingPlayers
        },
        param: 'order'
      });
    }

    this.playerOrder = newOrder.filter((playerId: string) => !!this.getPlayerById(playerId));
    this.playerOrderChangedSource.next(this.playerOrder);
  }

  changeMaxNumberOfPlayers(newMax: number) {
    newMax = Math.floor(newMax);
    if (newMax < MIN_NUMBER_OF_PLAYERS_PER_LOBBY || newMax > MAX_NUMBER_OF_PLAYERS_PER_LOBBY) {
      throw new OuistitiException({
        type: OuistitiErrorType.NUMBER_OUT_OF_RANGE,
        detail: {
          value: newMax,
          minimum: MIN_NUMBER_OF_PLAYERS_PER_LOBBY,
          maximum: MAX_NUMBER_OF_PLAYERS_PER_LOBBY
        }
      });
    }

    this.maxNumberOfPlayers = newMax;
    this.maximumNumberOfPlayersChangedSource.next(this.maxNumberOfPlayers);
  }

  changePlayerNickname(player: Player, nickname: string) {
    if (this.nicknameTaken(nickname)) {
      throw new OuistitiException({
        type: OuistitiErrorType.VALUE_TAKEN,
        detail: {
          provided: nickname,
          taken: this.players.map((player: Player) => player.nickname)
        }
      });
    }
    player.changeNickname(nickname);
  }

  changePlayerColour(player: Player, colour: PlayerColour) {
    if (this.colourTaken(colour)) {
      throw new OuistitiException({
        type: OuistitiErrorType.VALUE_TAKEN,
        detail: {
          provided: colour,
          taken: this.players.map((player: Player) => player.colour)
        }
      });
    }
    player.changeColour(colour);
  }
}
