import { Inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  LobbyInfo,
  OuistitiError,
  LobbyStatus,
  LobbyClosed,
  RoundInfo,
  CardPlayed,
  RoundStatus,
  RoundStatusChanged,
  BidsChanged,
  BreakPointInfo,
  RoundScores,
  roundStatusMock,
  lobbyStatusPlayerIsHostMock,
  lobbyListMock,
  getGameScoresMock
} from '@TomikaArome/ouistiti-shared';
import { ServerEvent } from '../classes/server-event.class';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private mock = false;
  private componentInit = +new Date();

  private get lobbyListInitialValue(): LobbyInfo[] {
    return this.mock ? lobbyListMock : [];
  }

  private get lobbyStatusInitialValue(): LobbyStatus {
    return this.mock
      ? lobbyStatusPlayerIsHostMock
      : {
          inLobby: false
        };
  }

  private get roundStatusInitialValue(): RoundInfo {
    return this.mock
      ? roundStatusMock
      : {
          number: 1,
          status: RoundStatus.BIDDING,
          breakPoint: null,
          currentPlayerId: '',
          currentTurnNumber: 1,
          playerOrder: [],
          cards: [],
          bids: {},
        };
  }

  private get gameScoresInitialValue(): RoundScores[] {
    return this.mock ? getGameScoresMock(roundStatusMock.playerOrder) : [];
  }

  private socket: Socket;
  private events: ServerEvent<unknown>[] = [
    new ServerEvent<OuistitiError>('error'),

    new ServerEvent<LobbyStatus>('lobbyStatus', this.lobbyStatusInitialValue),
    new ServerEvent<LobbyInfo[]>('lobbyList', this.lobbyListInitialValue),
    new ServerEvent<LobbyInfo>('lobbyUpdated'),
    new ServerEvent<LobbyClosed>('lobbyClosed'),
    new ServerEvent<LobbyInfo>('playerOrderRandomised'),

    new ServerEvent<RoundScores[]>('scores', this.gameScoresInitialValue),

    new ServerEvent<RoundInfo>('roundInfo', this.roundStatusInitialValue),
    new ServerEvent<BidsChanged>('bidsChanged'),
    new ServerEvent<CardPlayed>('cardPlayed'),
    new ServerEvent<RoundStatusChanged>('roundStatusChanged'),
    new ServerEvent<BreakPointInfo>('breakPointChanged'),
  ];

  private socketDisconnected$: BehaviorSubject<boolean>;

  get isConnected(): boolean {
    return (
      this.mock ||
      !!this.socket?.connected ||
      +new Date() < this.componentInit + 500
    );
  }

  constructor(@Inject('environment') private environment) {}

  connect() {
    console.log(`Connecting to ${this.environment.backendUri}/ouistiti`);
    this.socket = io(`${this.environment.backendUri}/ouistiti`);
    this.socketDisconnected$ = new BehaviorSubject<boolean>(false);
    this.socket.on('disconnect', () => {
      this.disconnect();
    });

    Object.values(this.events).forEach((serverEvent: ServerEvent<unknown>) => {
      serverEvent.bindSocket(this.socket);
    });

    this.emitEvent('listLobbies');
  }

  disconnect() {
    console.log('Disconnect');
    this.socketDisconnected$.next(true);
    this.socketDisconnected$.complete();
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  getServerEvent<T>(eventName: string): ServerEvent<T> {
    const serverEvent = this.events.find(
      (serverEvent: ServerEvent<unknown>) => serverEvent.name === eventName
    );
    if (!serverEvent) {
      throw `Event doesn't exist`;
    }
    return serverEvent as ServerEvent<T>;
  }

  getEvent<T>(eventName: string): Observable<T> {
    return this.getServerEvent<T>(eventName).event$ as Observable<T>;
  }

  emitEvent(eventType: string, payload?: unknown) {
    this.socket.emit(eventType, payload);
  }
}
