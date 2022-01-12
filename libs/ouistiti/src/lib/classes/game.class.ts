import { nanoid } from 'nanoid';
import { Round } from './round.class';
import { GameStatus } from '@TomikaArome/ouistiti-shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface StartGameSettings {
  playerOrder: string[]
}

export class Game {
  id = nanoid();
  status: GameStatus = GameStatus.INIT;
  rounds: Round[] = [];
  playerOrder: string[] = [];

  private gameComplete$ = new Subject<void>();
  private gameStatusChangedSource = new Subject<GameStatus>();
  gameStatusChanged$ = this.gameStatusChangedSource.asObservable().pipe(takeUntil(this.gameComplete$));

  get currentRound(): Round {
    return this.rounds[this.rounds.length - 1] ?? null;
  }

  get currentRoundNumber(): number {
    return this.currentRound?.roundNumber ?? 1;
  }

  get totalRoundCount(): number {
    const maxCardsPerPlayer = 8;
    return (maxCardsPerPlayer - 1) * 2 + this.playerOrder.length;
  }

  static createNewGame(): Game {
    return new Game();
  }

  startGame(settings: StartGameSettings) {
    this.playerOrder = settings.playerOrder;
    this.newRound();
  }

  newRound() {
    if (this.currentRound?.isLastRound) {
      this.status = GameStatus.COMPLETED;
      this.gameComplete$.next();
      this.gameComplete$.complete();
    } else {
      this.rounds.push(Round.createNewRound({
        roundNumber: this.rounds.length + 1,
        playerIds: this.playerOrder,
        maxCardsPerPlayer: 8 // TODO
      }));
    }
  }
}
