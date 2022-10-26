import { nanoid } from 'nanoid';
import { Round } from './round.class';
import {
  GameCreateParams,
  GameStatus,
  RoundScores,
} from '@TomikaArome/ouistiti-shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface GameCreateSettings extends GameCreateParams {
  playerOrder: string[];
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

  get scores(): RoundScores[] {
    return Array.from({ length: this.totalRoundCount }, (_, index: number) => {
      if (this.rounds[index]) {
        return this.rounds[index].scores;
      } else {
        const roundNumber = index + 1;
        const numberOfCards = this.numberOfCardsOnRound(roundNumber);
        return {
          roundNumber,
          numberOfCards,
          startingPlayerId:
            this.playerOrder[(roundNumber - 1) % this.playerOrder.length],
          knownTrump: numberOfCards === this.maxCardsPerPlayer,
          playerScores: this.playerOrder.map((playerId: string) => {
            return { playerId };
          }),
        };
      }
    });
  }

  private ended$ = new Subject<void>();
  private statusChangedSource = new Subject<GameStatus>();
  private roundStartedSource = new Subject<Round>();

  statusChanged$ = this.statusChangedSource
    .asObservable()
    .pipe(takeUntil(this.ended$));
  roundStarted$ = this.roundStartedSource
    .asObservable()
    .pipe(takeUntil(this.ended$));

  static createNewGame(settings: GameCreateSettings): Game {
    const newGame = new Game();
    newGame.playerOrder = settings.playerOrder;
    newGame.maxCardsPerPlayer = settings.maxCardsPerPlayer;
    newGame.newRound();
    return newGame;
  }

  numberOfCardsOnRound(roundNumber: number): number {
    if (roundNumber < this.maxCardsPerPlayer) {
      return roundNumber;
    }
    if (roundNumber < this.maxCardsPerPlayer + this.playerOrder.length) {
      return this.maxCardsPerPlayer;
    }
    return this.totalRoundCount - roundNumber + 1;
  }

  changeStatus(status: GameStatus) {
    if (status !== this.status) {
      if (status === GameStatus.SUSPENDED) {
        if (this.status !== GameStatus.IN_PROGRESS) {
          return;
        }
        this.currentRound?.breakPoint?.pauseTimer();
      } else if (this.status === GameStatus.SUSPENDED) {
        this.currentRound?.breakPoint?.resumeTimer();
      }
      this.status = status;
      this.statusChangedSource.next(status);
      if (status === GameStatus.CANCELLED) {
        this.ended$.next();
        this.ended$.complete();
      }
    }
  }

  newRound() {
    if (
      !this.currentRound ||
      this.currentRound?.roundNumber < this.totalRoundCount
    ) {
      const newRoundNumber = this.rounds.length + 1;
      this.rounds.push(
        Round.createNewRound({
          roundNumber: newRoundNumber,
          playerIds: this.playerOrder,
          maxCardsPerPlayer: this.maxCardsPerPlayer,
          numberOfCardsPerPlayer: this.numberOfCardsOnRound(newRoundNumber),
        })
      );
      this.roundStartedSource.next(this.currentRound);

      this.currentRound.completed$.subscribe(() => {
        this.currentRound.breakPoint.resolved$.subscribe(() => {
          if (this.currentRound.roundNumber === this.totalRoundCount) {
            this.changeStatus(GameStatus.COMPLETED);
            this.ended$.next();
            this.ended$.complete();
          } else {
            this.newRound();
          }
        });
        if (this.currentRound.roundNumber === this.totalRoundCount) {
          this.currentRound.breakPoint.bypass();
        }
      });
    }
  }
}
