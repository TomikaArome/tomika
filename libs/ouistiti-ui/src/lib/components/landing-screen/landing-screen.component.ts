import { Component } from '@angular/core';
import { LobbyListService } from '../../services/lobby-list.service';

@Component({
  selector: 'tmk-ouistiti-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.scss']
})
export class LandingScreenComponent {
  lobbyList$ = this.lobbyListService.lobbyList$;

  constructor(private lobbyListService: LobbyListService) {

  }
}
