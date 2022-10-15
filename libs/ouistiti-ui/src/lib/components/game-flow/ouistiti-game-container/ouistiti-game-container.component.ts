import { Component } from '@angular/core';
import { RoundService } from '../../../services/round.service';
import { PlayerService } from '../../../services/player.service';
import { GameStatus, PlayerInfo, RoundInfo, RoundScores, RoundStatus } from '@TomikaArome/ouistiti-shared';
import { pluck } from 'rxjs/operators';
import { GameService } from '../../../services/game.service';
import { LobbyService } from '../../../services/lobby.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'tmk-ouistiti-game-container',
  templateUrl: './ouistiti-game-container.component.html',
  styleUrls: ['./ouistiti-game-container.component.scss'],
})
export class OuistitiGameContainerComponent {
  roundInfo$: Observable<RoundInfo> = this.roundService.currentRoundInfo$;
  selfId$: Observable<string> = this.playerService.selfId$;
  currentLobbyPlayers$: Observable<PlayerInfo[]> = this.playerService.currentLobbyPlayers$;
  roundStatus$: Observable<RoundStatus> = this.roundInfo$.pipe(pluck('status'));
  currentGameScores$: Observable<RoundScores[]> = this.gameService.currentGameScores$;
  gameStatus$: Observable<GameStatus> = this.lobbyService.currentLobby$.pipe(pluck('gameStatus'));
  hostId$: Observable<string> = this.lobbyService.currentLobby$.pipe(pluck('hostId'));

  constructor(
    private roundService: RoundService,
    private playerService: PlayerService,
    private gameService: GameService,
    private lobbyService: LobbyService
  ) {}

  showBiddingPopup(status: RoundStatus): boolean {
    return status === RoundStatus.BIDDING;
  }

  showEndOfTurnPopup(status: RoundStatus): boolean {
    return status === RoundStatus.END_OF_TURN;
  }

  showEndOfRoundContainer(status: RoundStatus): boolean {
    return status === RoundStatus.COMPLETED;
  }

  showSuspendedScreen(status: GameStatus): boolean {
    return status === GameStatus.SUSPENDED;
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

  resumeGame() {
    this.lobbyService.resumeGame();
  }
}
