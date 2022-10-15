import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LobbyFillVacancyParams, LobbyInfo, PlayerInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-vacancy-selector',
  templateUrl: './lobby-vacancy-selector.component.html',
  styleUrls: ['lobby-vacancy-selector.component.scss']
})
export class LobbyVacancySelectorComponent {
  @Input()
  lobby: LobbyInfo;

  @Output()
  selectPlayer = new EventEmitter<LobbyFillVacancyParams>();

  @ViewChild('passwordField')
  passwordField: ElementRef;

  get orderedPlayers(): PlayerInfo[] {
    return this.lobby.players.sort((playerA: PlayerInfo, playerB: PlayerInfo) => {
      if (playerA.vacant && !playerB.vacant) { return -1; }
      else if (!playerA.vacant && playerB.vacant) { return 1; }
      return playerA.nickname.localeCompare(playerB.nickname);
    });
  }

  isHost(player: PlayerInfo): boolean {
    return this.lobby.hostId === player.id;
  }

  clickPlayer(player: PlayerInfo) {
    if (player.vacant) {
      const params: LobbyFillVacancyParams = {
        lobbyId: this.lobby.id,
        playerId: player.id
      };
      if (this.lobby.passwordProtected) {
        params.password = (this.passwordField.nativeElement as HTMLInputElement).value;
      }
      this.selectPlayer.emit(params);
    }
  }
}
