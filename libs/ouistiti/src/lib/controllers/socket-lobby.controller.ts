import { SocketController } from './socket.controller';
import { Lobby } from '../classes/lobby.class';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { LobbyJoinObserved, LobbyLeftObserved } from '../interfaces/lobby-oberserved.interface';
import { merge, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { GameStatus, LobbyClosed } from '@TomikaArome/ouistiti-shared';
import { SocketPlayerController } from './socket-player.controller';
import { SocketGameController } from './socket-game.controller';

export class SocketLobbyController {
  private get stop(): MonoTypeOperatorFunction<unknown> { return takeUntil(this.stop$); }

  constructor(readonly controller: SocketController,
              readonly lobby: Lobby,
              readonly stop$: Observable<unknown>) {
    this.stop$ = merge(this.stop$, this.lobby.lobbyClosed$);

    this.subscribePlayerJoined();
    this.subscribeUpdateLobby();
    this.subscribeLobbyClosed();

    this.init();
  }

  init() {
    new SocketPlayerController(this.controller, this.lobby.host, this.stop$);
    if (!this.controller.inLobby) {
      this.controller.emit('lobbyUpdated', this.lobby.info);
    } else if (this.lobby === this.controller.player.lobby) {
      this.controller.emitLobbyStatus();
    }
  }

  subscribePlayerJoined() {
    this.lobby.playerJoined$.pipe(this.stop).subscribe(({ player }: LobbyJoinObserved) => {
      new SocketPlayerController(this.controller, player, this.stop$);
      if (player === this.controller.player && player.lobby.gameStatus !== GameStatus.INIT) {
        new SocketGameController(this.controller, this.lobby.game, this.stop$);
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
        this.controller.emit('lobbyUpdated', this.lobby.info);
      } else if (this.lobby === this.controller.player.lobby) {
        this.controller.emitLobbyStatus();
      }
    })
  }

  subscribeLobbyClosed() {
    this.lobby.lobbyClosed$.subscribe(() => {
      if (!this.controller.inLobby) {
        const payload: LobbyClosed = {
          id: this.lobby.id
        };
        this.controller.emit('lobbyClosed', payload);
      } else if (this.lobby === this.controller.player.lobby) {
        this.controller.player = null;
        this.controller.emitLobbyStatus();
      }
    });
  }
}
