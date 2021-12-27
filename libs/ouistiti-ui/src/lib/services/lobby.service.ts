import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { GameStatus, LobbyInfo, PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { BehaviorSubject } from 'rxjs';
import { PlayerService } from './player.service';

@Injectable({ providedIn: 'root' })
export class LobbyService {
  private lobbies: LobbyInfo[] = [];

  private lobbyListSource = new BehaviorSubject<LobbyInfo[]>([]);
  lobbyList$ = this.lobbyListSource.asObservable();

  static isLobbyJoinable(lobbyInfo: LobbyInfo): boolean {
    return (lobbyInfo.gameStatus === GameStatus.INIT || lobbyInfo.gameStatus === GameStatus.SUSPENDED)
      && lobbyInfo.players.length < lobbyInfo.maxNumberOfPlayers;
  }

  constructor(private socketService: SocketService,
              private playerService: PlayerService) {
    this.socketService.listLobbies$.subscribe((lobbyList: LobbyInfo[]) => {
      lobbyList.forEach((lobbyInfo: LobbyInfo) => this.savePlayersFromLobbyInfo(lobbyInfo));
      this.lobbies = lobbyList.sort(this.lobbySortingFunction);
      this.lobbyListSource.next(this.lobbies);
    });
  }

  private lobbySortingFunction(lobbyA: LobbyInfo, lobbyB: LobbyInfo): number {
    const lobbyAJoinable = LobbyService.isLobbyJoinable(lobbyA);
    const lobbyBJoinable = LobbyService.isLobbyJoinable(lobbyB);
    if (lobbyAJoinable && !lobbyBJoinable) { return -1; }
    if (!lobbyAJoinable && lobbyBJoinable) { return 1; }

    if (lobbyA.gameStatus === GameStatus.INIT && lobbyB.gameStatus === GameStatus.SUSPENDED) { return -1; }
    if (lobbyA.gameStatus === GameStatus.SUSPENDED && lobbyB.gameStatus === GameStatus.INIT) { return 1; }

    return lobbyA.hostId.localeCompare(lobbyB.hostId);
  }

  getLobbyById(lobbyId: string): LobbyInfo {
    return this.lobbies.find(lobby => lobby.id === lobbyId) ?? null;
  }

  private savePlayersFromLobbyInfo(lobbyInfo: LobbyInfo) {
    lobbyInfo.players.forEach((playerInfo: PlayerInfo) => this.playerService.savePlayer(playerInfo));
  }
}
