import { Socket } from 'socket.io';
import { Lobby } from './lobby.class';
import { Player } from './player.class';
import { LobbyStatus } from '@TomikaArome/ouistiti-shared';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

export class SocketController {
  socket: Socket;
  lobby: Lobby = null;
  player: Player = null;

  private disconnectedSource = new Subject<void>();
  disconnected$ = this.disconnectedSource.asObservable();

  lobbyCreatedBySelf$ = this.untilDisconnect(Lobby.lobbyCreated$).pipe(
    filter((lobby: Lobby) => lobby.host === this.player)
  );
  lobbyCreatedByOtherWhileSelfNotInLobby$ = this.untilDisconnect(Lobby.lobbyCreated$).pipe(
    filter((lobby: Lobby) => !this.inLobby && lobby.host !== this.player)
  )

  get inLobby(): boolean {
    return this.lobby !== null;
  }

  constructor(clientSocket: Socket) {
    this.socket = clientSocket;
    console.log(`Client connected: ${this.socket.id}`);
    this.socket.on('disconnect', (reason: string) => { this.onDisconnect(reason); });
    Lobby.getLobbyList().forEach((lobby: Lobby) => { this.subscribeLobbyEvents(lobby); });
    this.subscribeLobbyCreated();
    this.emitLobbyList();
  }

  onDisconnect(reason: string) {
    console.log(`Client disconnected: ${this.socket.id} Reason: ${reason}`);
    this.disconnectedSource.next();
    this.disconnectedSource.complete();
  }

  emit(event: string, payload: unknown) {
    this.socket.emit(event, payload);
  }

  emitLobbyList() {
    this.emit('lobbyList', Lobby.getLobbyList().map(lobby => lobby.info));
    // this.emit('lobbyList', lobbyListMock);
  }

  private untilDisconnect<O>(observable: Observable<O>): Observable<O> {
    return observable.pipe(takeUntil(this.disconnected$));
  }

  subscribeLobbyCreated() {
    this.lobbyCreatedBySelf$.subscribe((lobby: Lobby) => {
      this.subscribeLobbyEvents(lobby);
      this.lobby = lobby;
      const eventPayload: LobbyStatus = {
        inLobby: true,
        lobby: this.lobby.info,
        playerId: this.player.id
      };
      this.emit('lobbyStatus', eventPayload);
    });

    this.lobbyCreatedByOtherWhileSelfNotInLobby$.subscribe((lobby: Lobby) => {
      this.subscribeLobbyEvents(lobby);
      // TODO send new lobby event
    })
  }

  subscribeLobbyEvents(lobby: Lobby) {
    this.subscribePlayerJoined(lobby);
    this.subscribePlayerLeft(lobby);
  }

  subscribeLobbyClosed(lobby: Lobby) {
    this.untilDisconnect(lobby.lobbyClosed$).subscribe(() => {
      if (lobby === this.lobby) {
        const eventPayload: LobbyStatus = {
          inLobby: false
        };
        this.emit('lobbyStatus', eventPayload);
        this.emitLobbyList();
      }
    });
  }

  subscribePlayerJoined(lobby: Lobby) {
    const selfJoinedOrOtherJoinedInOwnLobby = this.untilDisconnect(lobby.playerJoined$).pipe(
      tap((player: Player) => {
        if (player === this.player) {
          this.lobby = lobby;
        }
      }),
      filter(() => lobby === this.lobby)
    );
    const otherJoinedWhileSelfNotInLobby = this.untilDisconnect(lobby.playerJoined$).pipe(
      filter(() => !this.inLobby)
    );

    selfJoinedOrOtherJoinedInOwnLobby.subscribe((player: Player) => {
      console.log(player?.nickname, this.player?.nickname);
      if (player === this.player) {
        this.lobby = lobby;
      }
      if (lobby === this.lobby) {
        const eventPayload: LobbyStatus = {
          inLobby: true,
          lobby: this.lobby.info,
          playerId: this.player.id
        }
        this.emit('lobbyStatus', eventPayload);
      } else {
        // TODO update lobby
      }
    });

    otherJoinedWhileSelfNotInLobby.subscribe((player: Player) => {
      // TODO add lobby to list
    });
  }

  subscribePlayerLeft(lobby: Lobby) {
    this.untilDisconnect(lobby.playerLeft$).subscribe((player: Player) => {
      // TODO leave lobby
    });
  }
}
