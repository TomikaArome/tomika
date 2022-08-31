import { SocketController } from './socket.controller';
import { Player } from '../classes/player.class';
import { merge, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { LobbyLeftObserved } from '../interfaces/lobby-oberserved.interface';
import { SocketLobbyController } from './socket-lobby.controller';

export class SocketPlayerController {
  private controlledPlayerLeftLobby$ = this.player.lobby.playerLeft$.pipe(
    filter(({ player }: LobbyLeftObserved) => player === this.player)
  );

  private get stop(): MonoTypeOperatorFunction<unknown> {
    return takeUntil(this.stop$);
  }

  constructor(
    readonly controller: SocketController,
    readonly player: Player,
    readonly stop$: Observable<unknown>,
    readonly lobbyController: SocketLobbyController
  ) {
    this.stop$ = merge(this.stop$, this.controlledPlayerLeftLobby$);

    this.subscribeInfoChanged();
  }

  subscribeInfoChanged() {
    merge(
      this.player.nicknameChanged$,
      this.player.colourChanged$,
      this.player.symbolChanged$
    )
      .pipe(this.stop, debounceTime(SocketController.debounceTime))
      .subscribe(() => {
        if (!this.controller.inLobby) {
          this.controller.emit('lobbyUpdated', this.player.lobby.info);
        } else if (this.player.lobby === this.controller.player.lobby) {
          this.lobbyController.emitLobbyStatus();
        }
      });
  }
}
