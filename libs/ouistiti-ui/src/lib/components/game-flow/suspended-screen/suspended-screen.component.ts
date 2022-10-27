import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { faForward, faPlay, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'tmk-ouistiti-suspended-screen',
  templateUrl: './suspended-screen.component.html',
  styleUrls: ['./suspended-screen.component.scss'],
})
export class SuspendedScreenComponent {
  @Input()
  players: PlayerInfo[];
  @Input()
  hostId: string;
  @Input()
  selfId: string;

  @Output()
  resumeGame = new EventEmitter<void>();
  @Output()
  endGame = new EventEmitter<void>();
  @Output()
  skipToRound = new EventEmitter<number>();

  confirmEndGame = false;
  skipToRoundButtonDisabled = true;

  faPlay = faPlay;
  faXmark = faXmark;
  faForward = faForward;

  get noVacantPlayers(): boolean {
    return this.players.reduce((acc, curr) => acc && !curr.vacant, true);
  }

  get isSelfHost(): boolean {
    return this.selfId === this.hostId;
  }

  isPlayerHost(player: PlayerInfo): boolean {
    return player.id === this.hostId;
  }

  clickResumeGameButton() {
    if (this.noVacantPlayers && this.isSelfHost) {
      this.resumeGame.emit();
    }
  }

  clickEndGameButton() {
    if (this.isSelfHost) {
      this.endGame.emit();
    }
  }

  clickSkipToRoundButton(skipToRound: string) {
    if (/^[0-9]+$/.test(skipToRound) && this.isSelfHost) {
      this.skipToRound.emit(parseInt(skipToRound));
    }
  }

  skipToRoundInputChanged(event: KeyboardEvent) {
    this.skipToRoundButtonDisabled = !/^[0-9]+$/.test((event.target as HTMLInputElement).value);
  }
}
