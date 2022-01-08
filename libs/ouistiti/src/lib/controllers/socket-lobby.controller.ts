import { SocketController } from './socket.controller';
import { Lobby } from '../classes/lobby.class';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { LobbyJoinObserved, LobbyLeftObserved } from '../interfaces/lobby-oberserved.interface';
import { merge } from 'rxjs';
import { LobbyClosed } from '@TomikaArome/ouistiti-shared';

export class SocketLobbyController {
  private ownLobbyClosed$ = this.controlledLobby.lobbyClosed$.pipe(
    this.filterByOwnLobby(),
    tap(() => {
      this.socketController.lobby = null;
      this.socketController.player = null;
    })
  );
  private lobbyClosedWhileSelfNotInLobby$ = this.controlledLobby.lobbyClosed$.pipe(
    this.socketController.takeUntilDisconnected(),
    this.socketController.filterByNotInLobby()
  );

  private playerJoinedInOwnLobby$ = this.controlledLobby.playerJoined$.pipe(
    tap(({ player }: LobbyJoinObserved) => {
      if (player === this.socketController.player) {
        this.socketController.lobby = this.controlledLobby;
      }
    }),
    this.filterByOwnLobby()
  );
  private otherJoinedWhileSelfNotInLobby$ = this.controlledLobby.playerJoined$.pipe(
    this.socketController.filterByNotInLobby()
  );

  private playerLeftInOwnLobby$ = this.controlledLobby.playerLeft$.pipe(
    this.filterByOwnLobby(),
    tap(({ player }: LobbyLeftObserved) => {
      if (player === this.socketController.player) {
        this.socketController.lobby = null;
        this.socketController.player = null;
      }
    })
  );
  private otherLeftWhileSelfNotInLobby$ = this.controlledLobby.playerLeft$.pipe(
    this.socketController.filterByNotInLobby()
  );

  private lobbyUpdated$ = merge(
    this.controlledLobby.hostChanged$,
    this.controlledLobby.playerOrderChanged$,
    this.controlledLobby.maximumNumberOfPlayersChanged$
  )
  private ownLobbyUpdated$ = this.lobbyUpdated$.pipe(this.filterByOwnLobby());
  private lobbyUpdatedWhileSelfNotInLobby$ = this.lobbyUpdated$.pipe(this.socketController.filterByNotInLobby());

  constructor(private socketController: SocketController,
              private controlledLobby: Lobby) {
    this.subscribeEmitLobbyStatus();
    this.subscribeEmitLobbyUpdate();
    this.subscribeEmitLobbyClosed();
  }

  filterByOwnLobby() {
    return filter(() => this.controlledLobby === this.socketController.lobby)
  }

  subscribeEmitLobbyStatus() {
    merge(
      this.ownLobbyClosed$,
      this.playerJoinedInOwnLobby$,
      this.playerLeftInOwnLobby$,
      this.ownLobbyUpdated$
    ).pipe(
      debounceTime(SocketController.debounceTime),
      this.socketController.takeUntilDisconnected()
    ).subscribe(() => {
      this.socketController.emitLobbyStatus();
    });
  }

  subscribeEmitLobbyUpdate() {
    merge(
      this.otherJoinedWhileSelfNotInLobby$,
      this.otherLeftWhileSelfNotInLobby$,
      this.lobbyUpdatedWhileSelfNotInLobby$
    ).pipe(
      debounceTime(SocketController.debounceTime),
      this.socketController.takeUntilDisconnected()
    ).subscribe(() => {
      this.socketController.emit('lobbyUpdated', this.controlledLobby.info);
    });
  }

  subscribeEmitLobbyClosed() {
    this.lobbyClosedWhileSelfNotInLobby$.subscribe(() => {
      const payload: LobbyClosed = {
        id: this.controlledLobby.id
      };
      this.socketController.emit('lobbyClosed', payload);
    });
  }
}
