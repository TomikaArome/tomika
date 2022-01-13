import { nanoid } from 'nanoid';
import { Round } from './round.class';
import { GameCreateParams, GameStatus } from '@TomikaArome/ouistiti-shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface GameCreateSettings extends GameCreateParams {
  playerOrder: string[]
}

export class Game {
  id = nanoid(10);
  status: GameStatus = GameStatus.IN_PROGRESS;
  rounds: Round[] = [];
  playerOrder: string[] = [];
  maxCardsPerPlayer: number;

  get currentRound(): Round {
    return this.rounds[this.rounds.length - 1] ?? null;
  }

  get totalRoundCount(): number {
    return (this.maxCardsPerPlayer - 1) * 2 + this.playerOrder.length;
  }

  private gameComplete$ = new Subject<void>();
  private gameStatusChangedSource = new Subject<GameStatus>();
  gameStatusChanged$ = this.gameStatusChangedSource.asObservable().pipe(takeUntil(this.gameComplete$));

  private roundStartedSource = new Subject();
  roundStarted$ = this.roundStartedSource.asObservable();

  static createNewGame(settings: GameCreateSettings): Game {
    const newGame = new Game();
    newGame.playerOrder = settings.playerOrder;
    newGame.maxCardsPerPlayer = settings.maxCardsPerPlayer;
    newGame.newRound();
    return newGame;
  }

  changeStatus(status: GameStatus) {
    this.status = status;
    this.gameStatusChangedSource.next(status);
  }

  newRound() {
    if (this.currentRound?.isLastRound) {
      this.changeStatus(GameStatus.COMPLETED);
      this.gameComplete$.next();
      this.gameComplete$.complete();
    } else {
      this.rounds.push(Round.createNewRound({
        roundNumber: this.rounds.length + 1,
        playerIds: this.playerOrder,
        maxCardsPerPlayer: this.maxCardsPerPlayer
      }));
      this.roundStartedSource.next(this.currentRound);
    }
  }
}
