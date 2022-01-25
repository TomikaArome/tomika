import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { LobbyInfo, OuistitiError, LobbyStatus, LobbyClosed, RoundInfo, WonCardInfo, CardPlayed, RoundStatus, RoundStatusChanged, BidsChanged } from '@TomikaArome/ouistiti-shared';
import { ServerEvent } from '../classes/server-event.class';

@Injectable({ providedIn: 'root' })
export class SocketService {
  static readonly lobbyStatusInitialValue: LobbyStatus = {
    inLobby: false
  };

  static readonly roundStatusInitialValue: RoundInfo = {
    currentPlayerId: '',
    currentTurnNumber: 1,
    playerOrder: [],
    status: RoundStatus.BIDDING,
    cards: [],
    bids: {}
  };

  private socket: Socket;
  private events: ServerEvent<unknown>[] = [
    new ServerEvent<OuistitiError>('error'),

    new ServerEvent<LobbyStatus>('lobbyStatus', SocketService.lobbyStatusInitialValue),
    new ServerEvent<LobbyInfo[]>('lobbyList', []),
    new ServerEvent<LobbyInfo>('lobbyUpdated'),
    new ServerEvent<LobbyClosed>('lobbyClosed'),

    new ServerEvent<RoundInfo>('roundStatus', SocketService.roundStatusInitialValue),
    new ServerEvent<BidsChanged>('bidsChanged'),
    new ServerEvent<CardPlayed>('cardPlayed'),
    new ServerEvent<WonCardInfo[]>('trickWon'),
    new ServerEvent<RoundStatusChanged>('roundStatusChanged')
  ];

  private socketDisconnected$: BehaviorSubject<boolean>;

  constructor() {
    this.getEvent<OuistitiError>('error').subscribe(error => {
      console.log(error);
    });
  }

  connect() {
    console.log('Connect');
    this.socket = io('http://localhost:3333/ouistiti');
    this.socketDisconnected$ = new BehaviorSubject<boolean>(false);
    this.socket.on('disconnect', () => { this.disconnect(); });

    Object.values(this.events).forEach((serverEvent: ServerEvent<unknown>) => {
      serverEvent.bindSocket(this.socket);
    });

    this.emitEvent('listLobbies');

    // Test
    // this.emitEvent('createLobby', { host: { nickname: 'Thomas' } });
  }

  disconnect() {
    console.log('Disconnect');
    this.socketDisconnected$.next(true);
    this.socketDisconnected$.complete();
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  getEvent<T>(eventName: string): Observable<T> {
    const serverEvent = this.events.find((serverEvent: ServerEvent<unknown>) => serverEvent.name === eventName);
    if (!serverEvent) { throw `Event doesn't exist`; }
    return serverEvent.event$ as Observable<T>;
  }

  emitEvent(eventType: string, payload?: unknown) {
    this.socket.emit(eventType, payload);
  }
}
