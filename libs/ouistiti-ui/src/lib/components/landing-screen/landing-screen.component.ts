import { Component } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { LobbyInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.scss']
})
export class LandingScreenComponent {
  lobbyList$ = this.lobbyService.lobbyList$;

  private selectedLobbyId: string = null;
  createMode = false;

  get selectedLobby(): LobbyInfo {
    return this.lobbyService.getLobbyById(this.selectedLobbyId);
  }

  constructor(private lobbyService: LobbyService) {}

  selectLobby(lobby: LobbyInfo) {
    this.createMode = false;
    this.selectedLobbyId = lobby.id;
  }

  createNewLobby() {
    this.createMode = true;
    this.selectedLobbyId = null;
  }

  showLobbyJoin(): boolean {
    return !this.createMode && !!this.selectedLobbyId;
  }
}
