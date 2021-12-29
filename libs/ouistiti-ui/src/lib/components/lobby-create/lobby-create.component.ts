import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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
}
