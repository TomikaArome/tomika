import { SocketController } from './socket.controller';
import { Lobby } from '../classes/lobby.class';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { LobbyJoinObserved, LobbyLeftObserved } from '../interfaces/lobby-oberserved.interface';
import { merge, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { GameStatus, LobbyClosed, LobbyStatus } from '@TomikaArome/ouistiti-shared';
import { SocketPlayerController } from './socket-player.controller';
import { SocketGameController } from './socket-game.controller';
import { Game } from '../classes/game.class';

export class SocketLobbyController {
  stopIncludingLobbyClosed$ = merge(this.stop$, this.lobby.lobbyClosed$);
  stopIncludingSelfLeft$ = merge(this.stopIncludingLobbyClosed$, this.lobby.playerLeft$.pipe(
    filter(({ player }: LobbyLeftObserved) => this.controller.player === player)
  ));

  get isOwnLobby(): boolean {
    return this.lobby === this.controller.player?.lobby;
  }

  private get stop(): MonoTypeOperatorFunction<unknown> { return takeUntil(this.stopIncludingLobbyClosed$); }

  constructor(readonly controller: SocketController,
              readonly lobby: Lobby,
              readonly stop$: Observable<unknown>) {
    this.subscribePlayerJoined();
    this.subscribeUpdateLobby();
    this.subscribeLobbyClosed();
    this.subscribeGameStarted();

    this.init();
  }

  init() {
    new SocketPlayerController(this.controller, this.lobby.host, this.stop$, this);
    if (!this.controller.inLobby) {
      this.emitLobbyUpdated()
    } else if (this.isOwnLobby) {
      this.emitLobbyStatus();
    }
  }

  emitLobbyStatus() {
    const payload: LobbyStatus = {
      inLobby: this.controller.inLobby
    };
    if (this.controller.inLobby) {
      payload.lobby = this.controller.player.lobby.info;
      payload.playerId = this.controller.player.id;
    }
    this.controller.emit('lobbyStatus', payload);
  }

  emitLobbyUpdated() {
    this.controller.emit('lobbyUpdated', this.lobby.info);
  }

  subscribePlayerJoined() {
    this.lobby.playerJoined$.pipe(this.stop).subscribe(({ player }: LobbyJoinObserved) => {
      new SocketPlayerController(this.controller, player, this.stop$, this);
      if (player === this.controller.player && player.lobby.gameStatus !== GameStatus.INIT) {
        new SocketGameController(this.controller, this.lobby.game, this.stopIncludingSelfLeft$, this);
      }
    });
  }

  subscribeUpdateLobby() {
    const playerLeftWithSideEffect$ = this.lobby.playerLeft$.pipe(
      tap(({ player }: LobbyLeftObserved) => {
        if (player === this.controller.player) {
          this.controller.player = null;
        }
      })
    );

    merge(
      this.lobby.playerJoined$,
      playerLeftWithSideEffect$,
      this.lobby.hostChanged$,
      this.lobby.playerOrderChanged$,
      this.lobby.maximumNumberOfPlayersChanged$
    ).pipe(
      this.stop,
      debounceTime(SocketController.debounceTime)
    ).subscribe(() => {
      if (!this.controller.inLobby) {
        this.emitLobbyUpdated()
      } else if (this.isOwnLobby) {
        this.emitLobbyStatus();
      }
    })
  }

  subscribeLobbyClosed() {
    this.lobby.lobbyClosed$.pipe(
      takeUntil(this.stop$)
    ).subscribe(() => {
      if (!this.controller.inLobby) {
        const payload: LobbyClosed = {
          id: this.lobby.id
        };
        this.controller.emit('lobbyClosed', payload);
      } else if (this.isOwnLobby) {
        this.controller.player = null;
        this.emitLobbyStatus();
      }
    });
  }

  subscribeGameStarted() {
    this.lobby.gameStarted$.pipe(this.stop).subscribe((game: Game) => {
      new SocketGameController(this.controller, game, this.stopIncludingSelfLeft$, this);
    });
  }
}
