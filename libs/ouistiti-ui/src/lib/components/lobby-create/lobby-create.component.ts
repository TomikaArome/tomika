import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { LobbyService } from '../../services/lobby.service';
import { LobbyCreate } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-create',
  templateUrl: './lobby-create.component.html',
  styleUrls: ['./lobby-create.component.scss']
})
export class LobbyCreateComponent {
  form = new FormGroup({
    playerSettings: new FormControl(null),
    lobbySettings: new FormControl(null)
  });

  get errorMessage(): string {
    const errors: ValidationErrors = this.form.get('playerSettings').errors ?? {};
    if (errors.nicknameRequired?.touched) {
      return 'The nickname is required';
    }
    return '';
  }

  constructor(private lobbyService: LobbyService) {}

  create() {
    if (this.form.valid) {
      const params: LobbyCreate = {
        host: this.form.value.playerSettings,
        ...this.form.value.lobbySettings
      };
      this.lobbyService.createLobby(params);
    }
  }
}
