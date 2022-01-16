import { Socket } from 'socket.io';
import { Lobby } from '../classes/lobby.class';
import { Player } from '../classes/player.class';
import { LobbyStatus } from '@TomikaArome/ouistiti-shared';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketLobbyController } from './socket-lobby.controller';

export class SocketController {
  player: Player = null;
  stop$ = new Subject<void>();

  private get stop(): MonoTypeOperatorFunction<unknown> { return takeUntil(this.stop$); }

  get inLobby(): boolean {
    return this.player !== null;
  }

  static debounceTime = 5;

  constructor(private socket: Socket) {
    console.log(`Client connected: ${this.socket.id}`);

    this.subscribeLobbyCreated();

    this.init();
  }

  init() {
    this.socket.on('disconnect', (reason: string) => {
      this.onDisconnect(reason);
    });
    Lobby.getLobbyList().forEach((lobby: Lobby) => { new SocketLobbyController(this, lobby, this.stop$); });
  }

  onDisconnect(reason: string) {
    console.log(`Client disconnected: ${this.socket.id} Reason: ${reason}`);
    this.stop$.next();
    this.stop$.complete();

    if (this.inLobby) {
      this.player.lobby.removePlayer(this.player);
    }
  }

  subscribeLobbyCreated() {
    Lobby.lobbyCreated$.pipe(this.stop).subscribe((lobby: Lobby) => {
      new SocketLobbyController(this, lobby, this.stop$);
    });
  }

  emit(event: string, payload?: unknown) {
    this.socket.emit(event, payload);
  }

  emitLobbyList() {
    this.emit('lobbyList', Lobby.getLobbyList().map(lobby => lobby.info));
  }
}
