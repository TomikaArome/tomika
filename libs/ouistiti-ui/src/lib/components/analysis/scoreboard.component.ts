import { AfterViewInit, Component, ElementRef, HostBinding, Input, QueryList, ViewChildren } from '@angular/core';
import { PlayerColour, PlayerInfo, PlayerScore, PlayerSymbol, RoundScores } from '@TomikaArome/ouistiti-shared';
import { faBan, faCaretUp, faCaretDown, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-scoreboard',
  templateUrl: 'scoreboard.component.html',
  styleUrls: ['scoreboard.component.scss']
})
export class ScoreboardComponent implements AfterViewInit {
  @Input()
  scores: RoundScores[] = [];
  @Input()
  playersInOrder: PlayerInfo[];
  private _scrollToRoundSetBeforeViewInit = -1;
  @Input()
  set scrollToRound(roundNumber: number) {
    if (this.viewHasInit) {
      this.scrollToRoundElement(roundNumber);
    } else {
      this._scrollToRoundSetBeforeViewInit = roundNumber;
    }
  }

  roundHover = -1;
  playerHover = '';

  faCaretUp = faCaretUp;
  faCaretDown = faCaretDown;
  faBan = faBan;
  faQuestion = faQuestion;

  private viewHasInit = false;

  @HostBinding('style.--roundsCount')
  get roundsCount(): number {
    return this.scores.length;
  }

  @HostBinding('style.--playersCount')
  get playersCount(): number {
    return this.playersInOrder.length;
  }

  @ViewChildren('roundHeaderElement')
  roundHeaderElements: QueryList<ElementRef>;

  getPlayerScoresInOrder(playerScores: PlayerScore[]): Partial<PlayerScore>[] {
    return this.playersInOrder.map(player => playerScores.find(score => score.playerId === player.id));
  }

  getCumulativeScore(playerId: string, roundNumber: number): number {
    return this.scores.reduce((cumulativeScore: number, roundScores: RoundScores) => {
      if (!roundScores.playerScores || roundScores.roundNumber > roundNumber) { return cumulativeScore; }
      return cumulativeScore + (roundScores.playerScores.find(playerScore => playerScore.playerId === playerId).pointDifference ?? 0);
    }, 0);
  }

  isScoreHigherThanLast(playerId: string, roundNumber: number): boolean {
    return this.getCumulativeScore(playerId, roundNumber) >
      (roundNumber === 1 ? 0 : this.getCumulativeScore(playerId, roundNumber - 1));
  }

  getCellHoverClass(roundNumber: number, playerId: string): ({ [key: string]: boolean }) {
    return {
      'line-hover': (this.roundHover !== -1 && this.roundHover === roundNumber) || (this.playerHover !== '' && this.playerHover === playerId),
      'cell-hover': this.roundHover === roundNumber && this.playerHover === playerId
    }
  }

  getCellClass(roundScore: RoundScores, playerScore: Partial<PlayerScore>): ({ [key: string]: boolean }) {
    return {
      'score-is-higher': roundScore.playerScores && playerScore.pointDifference && this.isScoreHigherThanLast(playerScore.playerId, roundScore.roundNumber),
      ...this.getCellHoverClass(roundScore.roundNumber, playerScore.playerId)
    };
  }

  setCellHover(roundNumber = -1, playerId = '') {
    this.roundHover = roundNumber;
    this.playerHover = playerId;
  }

  getSymbolIconName(symbol: PlayerSymbol | string): string {
    return PlayerService.getSymbolIconName(symbol as PlayerSymbol);
  }
  getPlayerColourClass(colour: PlayerColour, playerId: string): ({ [key: string]: boolean }) {
    const classObj = this.getCellHoverClass(-1, playerId);
    classObj[PlayerService.getColourClassName(colour)] = true;
    return classObj;
  }

  getPlayerFromId(playerId: string): PlayerInfo {
    return this.playersInOrder.find((player: PlayerInfo) => playerId === player.id);
  }

  private scrollToRoundElement(roundNumber: number) {
    let elRef: ElementRef = this.roundHeaderElements.get(roundNumber) as ElementRef;
    if (!elRef) {
      elRef = this.roundHeaderElements.last as ElementRef;
    }
    (elRef.nativeElement as HTMLDivElement).scrollIntoView({ behavior: this._scrollToRoundSetBeforeViewInit > -1 ? 'auto' : 'smooth' });
  }

  ngAfterViewInit() {
    this.viewHasInit = true;
    if (this._scrollToRoundSetBeforeViewInit > -1) {
      this.scrollToRoundElement(this._scrollToRoundSetBeforeViewInit);
    }
  }
}
