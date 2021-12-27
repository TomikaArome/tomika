import { Component, Input } from '@angular/core';
import { LobbyInfo, PlayerColour, PlayerSymbol } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-join',
  templateUrl: './lobby-join.component.html',
  styleUrls: ['./lobby-join.component.scss']
})
export class LobbyJoinComponent {
  private _lobby: LobbyInfo = null;
  @Input()
  get lobby(): LobbyInfo { return this._lobby; }
  set lobby(value: LobbyInfo) {
    this._lobby = value;
    this.selectedColour = null;
    this.selectedSymbol = null;
  }

  selectedColour: PlayerColour = null;
  selectedSymbol: PlayerSymbol = null;

  get createMode(): boolean {
    return !this.lobby;
  }

  get showPasswordField(): boolean {
    return this.createMode || this.lobby.passwordProtected;
  }

  get takenColours(): PlayerColour[] {
    return this.createMode ? [] : this.lobby.players.map(player => player.colour);
  }
}
