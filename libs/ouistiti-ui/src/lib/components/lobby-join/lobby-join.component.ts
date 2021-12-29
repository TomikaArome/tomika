import { Component, Input } from '@angular/core';
import { LobbyInfo, PlayerColour } from '@TomikaArome/ouistiti-shared';
import { FormControl } from '@angular/forms';

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
    this.form.reset();
  }

  form = new FormControl({});

  get showPasswordField(): boolean {
    return this.lobby.passwordProtected;
  }

  get takenColours(): PlayerColour[] {
    return this.lobby.players.map(player => player.colour);
  }
}
