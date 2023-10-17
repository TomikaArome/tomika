import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import {
  GameStatus,
  LobbyClosed,
  LobbyCreateParams,
  LobbyFillVacancyParams,
  LobbyInfo,
  LobbyJoinParams,
  LobbyStatus,
  PlayerInfo,
  PlayerKickParams
} from '@TomikaArome/ouistiti-shared';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LobbyService {
  private lobbyList: LobbyInfo[] = [];

  currentLobby$: Observable<LobbyInfo> = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(map((status: LobbyStatus) => status.lobby ?? null));

  private lobbyListSource = new BehaviorSubject<LobbyInfo[]>([]);
  lobbyList$ = this.lobbyListSource.asObservable();

  // Used for creating a small randomising animation
  private _fakePlayerOrderWhileRandomising: string[] = null;
  get fakePlayerOrderWhileRandomising(): string[] { return [...this._fakePlayerOrderWhileRandomising]; }
  get isPlayerOrderRandomising(): boolean { return this._fakePlayerOrderWhileRandomising !== null; }
  private playerOrderRandomisingStop$ = new Subject();

  static isLobbyJoinable(lobbyInfo: LobbyInfo): boolean {
    return (
      (lobbyInfo.gameStatus === GameStatus.INIT &&
        lobbyInfo.players.length < lobbyInfo.maxNumberOfPlayers) ||
      (lobbyInfo.gameStatus === GameStatus.SUSPENDED &&
        LobbyService.lobbyHasVacancies(lobbyInfo))
    );
  }

  static lobbyHasVacancies(lobbyInfo: LobbyInfo): boolean {
    return lobbyInfo.players.reduce(
      (acc: boolean, player: PlayerInfo) => acc || player.vacant,
      false
    );
  }

  private static lobbySortingFunction(
    lobbyA: LobbyInfo,
    lobbyB: LobbyInfo
  ): number {
    const lobbyAJoinable = LobbyService.isLobbyJoinable(lobbyA);
    const lobbyBJoinable = LobbyService.isLobbyJoinable(lobbyB);
    if (lobbyAJoinable && !lobbyBJoinable) {
      return -1;
    }
    if (!lobbyAJoinable && lobbyBJoinable) {
      return 1;
    }

    if (
      lobbyA.gameStatus === GameStatus.INIT &&
      lobbyB.gameStatus === GameStatus.SUSPENDED
    ) {
      return -1;
    }
    if (
      lobbyA.gameStatus === GameStatus.SUSPENDED &&
      lobbyB.gameStatus === GameStatus.INIT
    ) {
      return 1;
    }

    return lobbyA.hostId.localeCompare(lobbyB.hostId);
  }

  constructor(private socketService: SocketService) {
    this.subscribeEvents();
  }

  subscribeEvents() {
    this.socketService
      .getEvent<LobbyInfo[]>('lobbyList')
      .subscribe((lobbies: LobbyInfo[]) => {
        this.lobbyList = lobbies.sort(LobbyService.lobbySortingFunction);
        this.lobbyListSource.next(this.lobbyList);
      });

    this.socketService
      .getEvent<LobbyInfo>('lobbyUpdated')
      .subscribe((lobbyInfo: LobbyInfo) => {
        this.updateLobby(lobbyInfo);
        this.lobbyListSource.next(this.lobbyList);
      });

    this.socketService
      .getEvent<LobbyClosed>('lobbyClosed')
      .subscribe(({ id }) => {
        const index = this.lobbyList.findIndex(
          (lobby: LobbyInfo) => lobby.id === id
        );
        this.lobbyList.splice(index, 1);
        this.lobbyListSource.next(this.lobbyList);
      });

    this.socketService
      .getEvent<LobbyInfo>('playerOrderRandomised')
      .subscribe((lobbyInfo: LobbyInfo) => {
        this.playerOrderRandomisingStop$.next(true);
        timer(0,50).pipe(takeUntil(this.playerOrderRandomisingStop$)).subscribe(() => {
          this._fakePlayerOrderWhileRandomising = [...lobbyInfo.playerOrder];
          for (let i = this._fakePlayerOrderWhileRandomising.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._fakePlayerOrderWhileRandomising[i], this._fakePlayerOrderWhileRandomising[j]] = [this._fakePlayerOrderWhileRandomising[j], this._fakePlayerOrderWhileRandomising[i]];
          }
        });
        timer(1000).pipe(takeUntil(this.playerOrderRandomisingStop$)).subscribe(() => {
          this.playerOrderRandomisingStop$.next(true);
          this._fakePlayerOrderWhileRandomising = null;
        });
      });
  }

  private updateLobby(lobbyInfo: LobbyInfo) {
    const originalLobbyIndex = this.lobbyList.findIndex(
      (lobby: LobbyInfo) => lobby.id === lobbyInfo.id
    );
    if (originalLobbyIndex === -1) {
      this.lobbyList.push(lobbyInfo);
    } else {
      Object.keys(this.lobbyList[originalLobbyIndex]).forEach(
        (key) => delete this.lobbyList[originalLobbyIndex][key]
      );
      Object.assign(this.lobbyList[originalLobbyIndex], lobbyInfo);
    }
  }

  createLobby(params: LobbyCreateParams) {
    this.socketService.emitEvent('createLobby', params);
  }

  joinLobby(params: LobbyJoinParams) {
    this.socketService.emitEvent('joinLobby', params);
  }

  leaveLobby() {
    this.socketService.emitEvent('leaveLobby');
    this.socketService.emitEvent('listLobbies');
  }

  kickFromLobby(params: PlayerKickParams) {
    this.socketService.emitEvent('kickPlayer', params);
  }

  changeCurrentLobbyOrder(order: string[]) {
    this.socketService.emitEvent('updateLobby', {
      playerOrder: order,
    });
  }

  changeCurrentLobbyHost(newHostId: string) {
    this.socketService.emitEvent('updateLobby', {
      hostId: newHostId,
    });
  }

  startGame() {
    this.socketService.emitEvent('startGame');
  }

  suspendGame() {
    this.socketService.emitEvent('suspendGame');
  }

  resumeGame() {
    this.socketService.emitEvent('resumeGame');
  }

  fillVacancy(params: LobbyFillVacancyParams) {
    this.socketService.emitEvent('fillVacancy', params);
  }

  endGame() {
    this.socketService.emitEvent('endGame');
  }

  randomisePlayerOrder() {
    this.socketService.emitEvent('randomisePlayerOrder');
  }
}
