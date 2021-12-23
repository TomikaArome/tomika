import { Component, Input } from '@angular/core';
import { LobbyInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-list',
  templateUrl: './lobby-list.component.html',
  styleUrls: ['lobby-list.component.scss']
})
export class LobbyListComponent {
  @Input()
  lobbyList: LobbyInfo[];
}
