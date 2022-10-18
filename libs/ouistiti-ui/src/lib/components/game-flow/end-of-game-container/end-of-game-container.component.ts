import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LobbyInfo, PlayerInfo, RoundScores } from '@TomikaArome/ouistiti-shared';
import { GameService } from '../../../services/game.service';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'tmk-ouistiti-end-of-game-container',
  templateUrl: './end-of-game-container.component.html',
  styleUrls: ['./end-of-game-container.component.scss']
})
export class EndOfGameContainerComponent {
  @Input()
  scores: RoundScores[] = [];
  @Input()
  lobbyInfo: LobbyInfo;
  @Input()
  isHost = false;

  @Output()
  endGame = new EventEmitter<void>();

  faCheck = faCheck;

  get lastPlayedRound(): number {
    const reversedScores = ([...this.scores]).reverse();
    return (reversedScores.find((roundScore: RoundScores) => typeof roundScore?.playerScores[0]?.pointDifference === 'number').roundNumber) ?? 1;
  }

  get playersInOrder(): PlayerInfo[] {
    return [...this.lobbyInfo.players].sort(
      (pA: PlayerInfo, pB: PlayerInfo) =>
        this.lobbyInfo.playerOrder.indexOf(pA.id) -
        this.lobbyInfo.playerOrder.indexOf(pB.id)
    );
  }

  get winners(): PlayerInfo[] {
    const cumulativeScores = GameService.getCumulativeScores(this.scores, this.lastPlayedRound);
    const highestScore = Object.values(cumulativeScores).reduce((acc, curr) => curr > acc ? curr : acc, 0);
    return this.playersInOrder.filter((player: PlayerInfo) => cumulativeScores[player.id] === highestScore);
  }

  get winnersText(): string {
    return this.winners.map((player: PlayerInfo) => player.nickname).join(', ');
  }

  clickEndGame() {
    this.endGame.emit();
  }
}
