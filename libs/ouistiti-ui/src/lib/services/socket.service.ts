import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { LobbyInfo, OuistitiError, SocketStatus } from '@TomikaArome/ouistiti-shared';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  private socketDisconnected$: BehaviorSubject<boolean>;

  private errorSource = new Subject<OuistitiError>();
  error$ = this.errorSource.asObservable();

  private socketStatusSource = new BehaviorSubject<SocketStatus>({ inLobby: false });
  socketStatus$ = this.socketStatusSource.asObservable();

  private listLobbiesSource = new BehaviorSubject<LobbyInfo[]>([]);
  listLobbies$ = this.listLobbiesSource.asObservable();

  private createLobbySource = new Subject<LobbyInfo>();
  createLobby$ = this.createLobbySource.asObservable();

  constructor() {
    this.error$.subscribe(error => {
      console.log(error);
    });
  }

  connect() {
    console.log('Connect');
    this.socket = io('http://localhost:3333/ouistiti');
    this.socketDisconnected$ = new BehaviorSubject<boolean>(false);
    this.subscribeEvents();
  }

  private subscribeEvents() {
    const eventNames = ['error', 'socketStatus', 'listLobbies', 'createLobby'];
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
    this.socket.disconnect();
  }

  emitEvent(eventType: string, payload?: unknown) {
    this.socket.emit(eventType, payload);
  }
}
