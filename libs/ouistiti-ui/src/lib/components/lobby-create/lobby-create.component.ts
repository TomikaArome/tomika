import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LobbyService } from '../../services/lobby.service';

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

  constructor(private lobbyService: LobbyService) {
  }

  create() {
    if (this.form.valid) {
      const params = {
        host: this.form.value.playerSettings,
        ...this.form.value.lobbySettings
      };
      this.lobbyService.createLobby(params);
    }
  }
}
