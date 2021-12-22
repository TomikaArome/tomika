import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { LobbyInfo } from '@TomikaArome/ouistiti-shared';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  private socketDisconnected$: BehaviorSubject<boolean>;

  private listLobbiesSource = new BehaviorSubject<LobbyInfo[]>([]);
  listLobbies$ = this.listLobbiesSource.asObservable();

  connect() {
    console.log('Connect');
    this.socket = io('http://localhost:3333/ouistiti');
    this.socketDisconnected$ = new BehaviorSubject<boolean>(false);
    this.subscribeEvents();
  }

  private subscribeEvents() {
    this.subscribeEvent('listLobbies');
  }

  private subscribeEvent(eventName: string) {
    this.socket.on(eventName, (payload) => {
      (this[`${eventName}Source`] as BehaviorSubject<any>).next(payload);
    });
  }

  disconnect() {
    console.log('Disconnect');
    this.socketDisconnected$.next(true);
    this.socketDisconnected$.complete();
    this.socket.disconnect();
  }
}
