import { Component, Input } from '@angular/core';
import { LobbyInfo, LobbyJoinParams, PlayerColour, PlayerInfo, PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { LobbyService } from '../../services/lobby.service';

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

  form = new FormGroup({
    playerSettings: new FormControl(null),
    password: new FormControl('test', [(control: AbstractControl) => {
      return this.lobby?.passwordProtected ? Validators.required(control) : null;
    }])
  });

  get showPasswordField(): boolean {
    return this.lobby.passwordProtected;
  }

  get takenColours(): PlayerColour[] {
    return this.lobby.players.map((player: PlayerInfo) => player.colour);
  }
  get takenNicknames(): string[] {
    return this.lobby.players.map((player: PlayerInfo) => player.nickname);
  }

  get errorMessage(): string {
    const errors: ValidationErrors = this.form.get('playerSettings').errors ?? {};
    if (errors.nicknameRequired?.touched) {
      return 'The nickname is required';
    } else if (errors.nicknameTaken) {
      return 'That nickname is already taken';
    }
    return '';
  }

  constructor(private lobbyService: LobbyService) {}

  join() {
    if (this.form.valid) {
      const params: LobbyJoinParams = {
        id: this.lobby.id,
        player: this.form.value.playerSettings,
      }
      if (this.lobby.passwordProtected) {
        params.password = this.form.value.password;
      }
      this.lobbyService.joinLobby(params);
    }
  }
}
