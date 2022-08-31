import { Component } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { LobbyInfo } from '@TomikaArome/ouistiti-shared';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'tmk-ouistiti-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.scss'],
})
export class LandingScreenComponent {
  lobbyList$: Observable<LobbyInfo[]> = this.lobbyService.lobbyList$;
  selectedLobby$: Observable<LobbyInfo> = this.lobbyService.lobbyList$.pipe(
    map(
      (lobbyList: LobbyInfo[]) =>
        lobbyList.find(
          (lobby: LobbyInfo) => lobby.id === this.selectedLobbyId
        ) ?? null
    )
  );

  private selectedLobbyId: string = null;
  createMode = false;

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
