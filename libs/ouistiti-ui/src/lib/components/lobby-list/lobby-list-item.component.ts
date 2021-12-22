import { Component, Input } from '@angular/core';
import { LobbyInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-list-item',
  templateUrl: './lobby-list-item.component.html',
  styleUrls: ['./lobby-list-item.component.scss']
})
export class LobbyListItemComponent {
  @Input()
  lobbyInfo: LobbyInfo;

  playerNicknames(): string[] {
    return this.lobbyInfo.playerNicknames
      .filter(nickname => nickname !== this.lobbyInfo.hostNickname)
      .sort();
  }

  noOtherPlayers(): boolean {
    return this.playerNicknames().length === 0;
  }
}
