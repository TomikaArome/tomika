import { SocketController } from './socket.controller';
import { Player } from '../classes/player.class';
import { Lobby } from '../classes/lobby.class';
import { merge } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { LobbyLeftObserved } from '../interfaces/lobby-oberserved.interface';

export class SocketPlayerController {
  private controlledPlayerLeftLobby$ = this.controlledPlayerLobby.playerLeft$.pipe(
    filter(({ player }: LobbyLeftObserved) => player === this.controlledPlayer)
  );
  private controlledLobbyClosed$ = this.controlledPlayerLobby.lobbyClosed$;

  private playerInfoChanged$ = merge(
    this.controlledPlayer.nicknameChanged$,
    this.controlledPlayer.colourChanged$,
    this.controlledPlayer.symbolChanged$
  ).pipe(
    this.takeUntilControlledPlayerNoLongerInLobby(),
    this.socketController.takeUntilDisconnected(),
    debounceTime(SocketController.debounceTime)
  );

  constructor(private socketController: SocketController,
              private controlledPlayer: Player,
              private controlledPlayerLobby: Lobby) {
    this.subscribeEmitLobbyStatus();
    this.subscribeEmitLobbyUpdate();
  }

  takeUntilControlledPlayerNoLongerInLobby() {
    return takeUntil(merge(
      this.controlledPlayerLeftLobby$,
      this.controlledLobbyClosed$
    ));
  }

  filterByOwnLobby() {
    return filter(() => this.controlledPlayerLobby === this.socketController.lobby)
  }

  subscribeEmitLobbyStatus() {
    this.playerInfoChanged$.pipe(
      this.filterByOwnLobby()
    ).subscribe(() => {
      this.socketController.emitLobbyStatus();
    });
  }

  subscribeEmitLobbyUpdate() {
    this.playerInfoChanged$.pipe(
      this.socketController.filterByNotInLobby()
    ).subscribe(() => {
      this.socketController.emit('lobbyUpdated', this.controlledPlayerLobby.info);
    });
  }
}
