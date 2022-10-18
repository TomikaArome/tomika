import { Component } from '@angular/core';
import { RoundService } from '../../../services/round.service';
import { PlayerService } from '../../../services/player.service';
import { GameStatus, LobbyInfo, PlayerInfo, RoundInfo, RoundScores, RoundStatus } from '@TomikaArome/ouistiti-shared';
import { map, pluck } from 'rxjs/operators';
import { GameService } from '../../../services/game.service';
import { LobbyService } from '../../../services/lobby.service';
import { combineLatest, Observable } from 'rxjs';
import { faPause } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'tmk-ouistiti-game-container',
  templateUrl: './ouistiti-game-container.component.html',
  styleUrls: ['./ouistiti-game-container.component.scss'],
})
export class OuistitiGameContainerComponent {
  roundInfo$: Observable<RoundInfo> = this.roundService.currentRoundInfo$;
  lobbyInfo$: Observable<LobbyInfo> = this.lobbyService.currentLobby$;
  selfId$: Observable<string> = this.playerService.selfId$;
  currentLobbyPlayers$: Observable<PlayerInfo[]> = this.playerService.currentLobbyPlayers$;
  roundStatus$: Observable<RoundStatus> = this.roundInfo$.pipe(pluck('status'));
  currentGameScores$: Observable<RoundScores[]> = this.gameService.currentGameScores$;
  gameStatus$: Observable<GameStatus> = this.lobbyService.currentLobby$.pipe(pluck('gameStatus'));
  hostId$: Observable<string> = this.lobbyService.currentLobby$.pipe(pluck('hostId'));
  currentPlayer$: Observable<PlayerInfo> = combineLatest(this.currentLobbyPlayers$, this.roundInfo$).pipe(
    map(([players, roundInfo]: [PlayerInfo[], RoundInfo]) => players.find((p: PlayerInfo) => p.id === roundInfo.currentPlayerId))
  );

  faPause = faPause;

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

  showEndOfGameContainer(status: GameStatus): boolean {
    return status === GameStatus.COMPLETED || status === GameStatus.CANCELLED;
  }

  showSuspendedScreen(status: GameStatus): boolean {
    return status === GameStatus.SUSPENDED;
  }

  showPlayerTurn(status: RoundStatus): boolean {
    return status === RoundStatus.PLAY;
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

  suspendGame() {
    this.lobbyService.suspendGame();
  }

  endGame() {
    this.lobbyService.endGame();
  }
}
