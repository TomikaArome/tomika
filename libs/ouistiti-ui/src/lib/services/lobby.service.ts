import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { GameStatus, LobbyClosed, LobbyCreateParams, LobbyInfo, LobbyJoinParams, LobbyStatus, PlayerKickParams } from '@TomikaArome/ouistiti-shared';
import { merge, Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LobbyService {
  currentLobby$: Observable<LobbyInfo> = this.socketService.getEvent<LobbyStatus>('lobbyStatus').pipe(
    map((status: LobbyStatus) => status.lobby ?? null)
  );

  lobbyList$: Observable<LobbyInfo[]> = merge(
    this.socketService.getEvent<LobbyInfo[]>('lobbyList').pipe(map((v: LobbyInfo[]) => { return { event: 'lobbyList', payload: v } })),
    this.socketService.getEvent<LobbyInfo>('lobbyUpdated').pipe(map((v: LobbyInfo) => { return { event: 'lobbyUpdated', payload: v } })),
    this.socketService.getEvent<LobbyClosed>('lobbyClosed').pipe(map((v: LobbyClosed) => { return { event: 'lobbyClosed', payload: v } }))
  ).pipe(
    scan((acc: LobbyInfo[], curr) => {
      if (curr.event === 'lobbyList') {

        acc = (curr.payload as LobbyInfo[]).sort(LobbyService.lobbySortingFunction);

      } else if (curr.event === 'lobbyUpdated') {

        const lobbyInfo = curr.payload as LobbyInfo;
        const index = acc.findIndex((lobby: LobbyInfo) => lobby.id === lobbyInfo.id);
        if (index > -1) {
          acc[index] = lobbyInfo;
        } else {
          acc.push(lobbyInfo);
        }

      } else {
        console.log('lobbyClose');
        const lobbyInfo = curr.payload as LobbyClosed;
        const index = acc.findIndex((lobby: LobbyInfo) => lobby.id === lobbyInfo.id);
        acc.splice(index, 1);

      }
      return acc;
    }, [])
  );

  static isLobbyJoinable(lobbyInfo: LobbyInfo): boolean {
    return (lobbyInfo.gameStatus === GameStatus.INIT || lobbyInfo.gameStatus === GameStatus.SUSPENDED)
      && lobbyInfo.players.length < lobbyInfo.maxNumberOfPlayers;
  }

  private static lobbySortingFunction(lobbyA: LobbyInfo, lobbyB: LobbyInfo): number {
    const lobbyAJoinable = LobbyService.isLobbyJoinable(lobbyA);
    const lobbyBJoinable = LobbyService.isLobbyJoinable(lobbyB);
    if (lobbyAJoinable && !lobbyBJoinable) { return -1; }
    if (!lobbyAJoinable && lobbyBJoinable) { return 1; }

    if (lobbyA.gameStatus === GameStatus.INIT && lobbyB.gameStatus === GameStatus.SUSPENDED) { return -1; }
    if (lobbyA.gameStatus === GameStatus.SUSPENDED && lobbyB.gameStatus === GameStatus.INIT) { return 1; }

    return lobbyA.hostId.localeCompare(lobbyB.hostId);
  }

  constructor(private socketService: SocketService) {}

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
      playerOrder: order
    });
  }

  changeCurrentLobbyHost(newHostId: string) {
    this.socketService.emitEvent('updateLobby', {
      hostId: newHostId
    });
  }

  startGame() {
    this.socketService.emitEvent('startGame');
  }
}
