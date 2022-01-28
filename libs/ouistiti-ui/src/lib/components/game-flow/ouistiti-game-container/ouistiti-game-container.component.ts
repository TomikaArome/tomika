import { Component } from '@angular/core';
import { RoundService } from '../../../services/round.service';
import { PlayerService } from '../../../services/player.service';
import { RoundInfo, RoundStatus, WonCardInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-game-container',
  templateUrl: './ouistiti-game-container.component.html',
  styleUrls: ['./ouistiti-game-container.component.scss']
})
export class OuistitiGameContainerComponent {
  roundStatus$ = this.roundService.currentRoundInfo$;
  selfId$ = this.playerService.selfId$;
  currentLobbyPlayers$ = this.playerService.currentLobbyPlayers$;

  constructor(private roundService: RoundService,
              private playerService: PlayerService) {
  }

  showBiddingPopup(status: RoundStatus): boolean {
    return status === RoundStatus.BIDDING;
  }

  showEndOfTurnPopup(info: RoundInfo): boolean {
    const winningCardIndex = info.cards.findIndex((card: WonCardInfo) =>
      card.playedOnTurn === info.currentTurnNumber && card.ownerId === card.winnerId);
    return info.status === RoundStatus.PLAY && winningCardIndex > -1;
  }

  placeBid(bid: number) {
    this.roundService.placeBid(bid);
  }

  cancelBid() {
    this.roundService.cancelBid();
  }

  playCard(cardId: string) {
    this.roundService.playCard(cardId);
  }

  acknowledgeBreakPoint() {
    this.roundService.acknowledgeBreakPoint();
  }
}
