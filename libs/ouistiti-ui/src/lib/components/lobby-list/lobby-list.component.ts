import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LobbyInfo } from '@TomikaArome/ouistiti-shared';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'tmk-ouistiti-lobby-list',
  templateUrl: './lobby-list.component.html',
  styleUrls: ['lobby-list.component.scss']
})
export class LobbyListComponent {
  @Input()
  lobbyList: LobbyInfo[];

  @Output()
  selectLobby = new EventEmitter<LobbyInfo>();
  @Output()
  createLobby = new EventEmitter<void>();

  clickLobby(lobby: LobbyInfo) {
    if (this.isLobbyJoinable(lobby)) {
      this.selectLobby.emit(lobby);
    }
  }

  isEmpty(): boolean {
    return this.lobbyList.length === 0;
  }

  isLobbyJoinable(lobby: LobbyInfo): boolean {
    return LobbyService.isLobbyJoinable(lobby);
  }
}
