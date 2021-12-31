import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LobbyService } from '../../services/lobby.service';
import { SocketService } from '../../services/socket.service';
import { filter, map } from 'rxjs/operators';
import { OuistitiError, OuistitiErrorType } from '@TomikaArome/ouistiti-shared';
import { Observable } from 'rxjs';

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

  nicknameTooLongError$: Observable<string> = this.socketService.error$.pipe(
    filter((error: OuistitiError) => {
      return error.caller === 'createLobby' && error.type === OuistitiErrorType.STRING_TOO_LONG
        && error.detail.param === 'nickname';
    }),
    map((error: OuistitiError) => {
      return `Nickname should be maximum ${error.detail.maxLength} characters`;
    })
  );

  constructor(private lobbyService: LobbyService,
              private socketService: SocketService) {}

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
