import { Component } from '@angular/core';
import { RoundService } from '../../../services/round.service';
import { PlayerService } from '../../../services/player.service';
import { RoundStatus } from '@TomikaArome/ouistiti-shared';
import { pluck } from 'rxjs/operators';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'tmk-ouistiti-game-container',
  templateUrl: './ouistiti-game-container.component.html',
  styleUrls: ['./ouistiti-game-container.component.scss']
})
export class OuistitiGameContainerComponent {
  roundInfo$ = this.roundService.currentRoundInfo$;
  selfId$ = this.playerService.selfId$;
  currentLobbyPlayers$ = this.playerService.currentLobbyPlayers$;
  roundStatus$ = this.roundInfo$.pipe(pluck('status'));
  currentGameScores$ = this.gameService.currentGameScores$;

  constructor(private roundService: RoundService,
              private playerService: PlayerService,
              private gameService: GameService) {
  }

  showBiddingPopup(status: RoundStatus): boolean {
    return status === RoundStatus.BIDDING;
  }

  showEndOfTurnPopup(status: RoundStatus): boolean {
    return status === RoundStatus.END_OF_TURN;
  }

  showEndOfRoundContainer(status: RoundStatus): boolean {
    return status === RoundStatus.COMPLETED;
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
