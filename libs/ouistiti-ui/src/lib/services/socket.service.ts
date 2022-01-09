import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  LobbyInfo,
  OuistitiError,
  LobbyStatus,
  LobbyClosed,
  lobbyStatusPlayerIsHostMock
} from '@TomikaArome/ouistiti-shared';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  private socketDisconnected$: BehaviorSubject<boolean>;

  private errorSource = new Subject<OuistitiError>();
  error$ = this.errorSource.asObservable();

  private lobbyStatusSource = new BehaviorSubject<LobbyStatus>({ inLobby: false });
  // private lobbyStatusSource = new BehaviorSubject<LobbyStatus>(lobbyStatusPlayerIsHostMock);
  lobbyStatus$ = this.lobbyStatusSource.asObservable();

  private lobbyListSource = new BehaviorSubject<LobbyInfo[]>([]);
  lobbyList$ = this.lobbyListSource.asObservable();
  private lobbyUpdatedSource = new Subject<LobbyInfo>();
  lobbyUpdated$ = this.lobbyUpdatedSource.asObservable();
  private lobbyClosedSource = new Subject<LobbyClosed>();
  lobbyClosed$ = this.lobbyClosedSource.asObservable();

  constructor() {
    this.error$.subscribe(error => {
      console.log(error);
    });
  }

  connect() {
    console.log('Connect');
    this.socket = io('http://localhost:3333/ouistiti');
    this.socketDisconnected$ = new BehaviorSubject<boolean>(false);
    this.socket.on('disconnect', () => { this.disconnect(); });
    this.subscribeEvents();
    this.emitEvent('listLobbies');
  }

  private subscribeEvents() {
    const eventNames = ['error', 'lobbyStatus', 'lobbyList', 'lobbyUpdated', 'lobbyClosed'];
    eventNames.forEach(eventName => this.subscribeEvent(eventName));
  }

  private subscribeEvent(eventName: string) {
    this.socket.on(eventName, (payload) => {
      (this[`${eventName}Source`] as Subject<unknown>).next(payload);
    });
  }

  disconnect() {
    console.log('Disconnect');
    this.socketDisconnected$.next(true);
    this.socketDisconnected$.complete();
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  emitEvent(eventType: string, payload?: unknown) {
    this.socket.emit(eventType, payload);
  }
}
