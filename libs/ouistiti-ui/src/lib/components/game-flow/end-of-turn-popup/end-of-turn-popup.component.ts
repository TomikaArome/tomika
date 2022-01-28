import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerInfo, RoundInfo, WonCardInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-end-of-turn-popup',
  templateUrl: './end-of-turn-popup.component.html',
  styleUrls: ['end-of-turn-popup.component.scss']
})
export class EndOfTurnPopupComponent {
  @Input()
  roundInfo: RoundInfo;
  @Input()
  players: PlayerInfo[];
  @Input()
  selfId: string;

  @Output()
  nextButtonClicked = new EventEmitter<void>();

  get playersInOrder(): PlayerInfo[] {
    return [...this.players].sort((pA: PlayerInfo, pB: PlayerInfo) =>
      this.roundInfo.playerOrder.indexOf(pA.id) - this.roundInfo.playerOrder.indexOf(pB.id));
  }

  get winningCard(): WonCardInfo {
    return this.roundInfo.cards.find((card: WonCardInfo) =>
      card.playedOnTurn === this.roundInfo.currentTurnNumber && card.ownerId === card.winnerId) as WonCardInfo;
  }

  get winner(): PlayerInfo {
    const winningCard = this.winningCard;
    if (!winningCard) { return null; }
    return this.players.find((player: PlayerInfo) => player.id === winningCard.winnerId);
  }

  get breakPointHasTimer(): boolean {
    return (this.roundInfo?.breakPoint?.timerExpires ?? -1) > -1
  }

  get breakPointHasAcknowledgements(): boolean {
    return Object.keys(this.roundInfo?.breakPoint?.acknowledgements ?? {}).length > 0;
  }

  playerAcknowledgedEndOfTurn(playerId: string): boolean {
    return !!((this.roundInfo.breakPoint?.acknowledgements ?? {})[playerId]);
  }

  clickNextButton() {
    this.nextButtonClicked.emit();
  }
}
