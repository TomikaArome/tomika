import { Socket } from 'socket.io';
import { Lobby } from '../classes/lobby.class';
import { Player } from '../classes/player.class';
import { LobbyStatus } from '@TomikaArome/ouistiti-shared';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SocketLobbyController } from './socket-lobby.controller';

export class SocketController {
  lobby: Lobby = null;
  player: Player = null;

  private disconnectedSource = new Subject<void>();
  disconnected$ = this.disconnectedSource.asObservable();

  lobbyCreatedBySelf$ = Lobby.lobbyCreated$.pipe(
    this.takeUntilDisconnected(),
    filter((lobby: Lobby) => lobby.host === this.player)
  );
  lobbyCreatedByOtherWhileSelfNotInLobby$ = Lobby.lobbyCreated$.pipe(
    this.takeUntilDisconnected(),
    filter((lobby: Lobby) => !this.inLobby && lobby.host !== this.player)
  )

  get inLobby(): boolean {
    return this.lobby !== null;
  }

  constructor(private socket: Socket) {
    console.log(`Client connected: ${this.socket.id}`);
    this.socket.on('disconnect', (reason: string) => { this.onDisconnect(reason); });
    Lobby.getLobbyList().forEach((lobby: Lobby) => { new SocketLobbyController(this, lobby); });
    this.subscribeLobbyCreated();
  }

  onDisconnect(reason: string) {
    console.log(`Client disconnected: ${this.socket.id} Reason: ${reason}`);
    this.disconnectedSource.next();
    this.disconnectedSource.complete();

    if (this.inLobby) {
      this.lobby.removePlayer(this.player);
    }
  }

  emit(event: string, payload: unknown) {
    this.socket.emit(event, payload);
  }

  emitLobbyList() {
    this.emit('lobbyList', Lobby.getLobbyList().map(lobby => lobby.info));
    // this.emit('lobbyList', lobbyListMock);
  }

  emitLobbyStatus() {
    const payload: LobbyStatus = {
      inLobby: this.inLobby
    };
    if (this.inLobby) {
      payload.lobby = this.lobby.info;
      payload.playerId = this.player.id;
    }
    this.emit('lobbyStatus', payload);
  }

  takeUntilDisconnected<T>(): MonoTypeOperatorFunction<T> {
    return takeUntil(this.disconnected$);
  }

  filterByNotInLobby<T>(): MonoTypeOperatorFunction<T> {
    return filter(() => !this.inLobby)
  }

  subscribeLobbyCreated() {
    Lobby.lobbyCreated$.pipe(this.takeUntilDisconnected()).subscribe((lobby: Lobby) => {
      new SocketLobbyController(this, lobby);
    });

    this.lobbyCreatedBySelf$.subscribe((lobby: Lobby) => {
      new SocketLobbyController(this, lobby);
      this.lobby = lobby;
      this.emitLobbyStatus();
    });

    this.lobbyCreatedByOtherWhileSelfNotInLobby$.subscribe((lobby: Lobby) => {
      this.emit('lobbyUpdated', lobby.info);
    });
  }
}
