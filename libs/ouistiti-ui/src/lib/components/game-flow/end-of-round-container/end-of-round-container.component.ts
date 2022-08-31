import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  PlayerInfo,
  RoundInfo,
  RoundScores,
} from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-end-of-round-container',
  templateUrl: './end-of-round-container.component.html',
  styleUrls: ['end-of-round-container.component.scss'],
})
export class EndOfRoundContainerComponent {
  @Input()
  scores: RoundScores[] = [];
  @Input()
  roundInfo: RoundInfo;
  @Input()
  players: PlayerInfo[];
  @Input()
  selfId: string;

  @Output()
  nextButtonClicked = new EventEmitter<void>();

  get playersInOrder(): PlayerInfo[] {
    return [...this.players].sort(
      (pA: PlayerInfo, pB: PlayerInfo) =>
        this.roundInfo.playerOrder.indexOf(pA.id) -
        this.roundInfo.playerOrder.indexOf(pB.id)
    );
  }

  get breakPointHasTimer(): boolean {
    return (this.roundInfo?.breakPoint?.timerExpires ?? -1) > -1;
  }

  get breakPointHasAcknowledgements(): boolean {
    return (
      Object.keys(this.roundInfo?.breakPoint?.acknowledgements ?? {}).length > 0
    );
  }

  playerAcknowledgedEndOfTurn(playerId: string): boolean {
    return !!(this.roundInfo.breakPoint?.acknowledgements ?? {})[playerId];
  }

  clickNextButton() {
    this.nextButtonClicked.emit();
  }
}
