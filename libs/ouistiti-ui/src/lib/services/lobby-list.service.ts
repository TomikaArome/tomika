import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { LobbyInfo, PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { BehaviorSubject } from 'rxjs';
import { PlayerDatabaseService } from './player-database.service';

@Injectable({ providedIn: 'root' })
export class LobbyListService {
  private lobbyListSource = new BehaviorSubject<LobbyInfo[]>([]);
  lobbyList$ = this.lobbyListSource.asObservable();

  constructor(private socketService: SocketService,
              private playerDatabaseService: PlayerDatabaseService) {
    this.socketService.listLobbies$.subscribe((lobbyList: LobbyInfo[]) => {
      lobbyList.forEach((lobbyInfo: LobbyInfo) => this.savePlayersFromLobbyInfo(lobbyInfo));
      this.lobbyListSource.next(lobbyList);
    });
  }

  private savePlayersFromLobbyInfo(lobbyInfo: LobbyInfo) {
    lobbyInfo.players.forEach((playerInfo: PlayerInfo) => this.playerDatabaseService.savePlayer(playerInfo));
  }
}
