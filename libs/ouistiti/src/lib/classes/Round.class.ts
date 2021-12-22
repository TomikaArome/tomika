import { Turn } from './Turn.class';
import { Card } from './Card.class';
import { Game } from './Game.class';

export enum RoundStage {
  ASC, NO_TRUMPS, DESC
}

export class Round {
  game: Game;
  stage: RoundStage;
  roundNumber: number;
  numberOfCards: number;
  turns: Turn[];
  cards: Card[];
  trumpCard: Card;

  private constructor(game: Game) {
    this.game = game;
  }

  initRound() {
    this.roundNumber = this.game.rounds.indexOf(this) + 1;
    const numberOfPlayers = this.game.lobby.players.length;
    const maxCardsPerPlayer = 8;

    if (numberOfPlayers < 4 || numberOfPlayers > 6) { throw 'Need between 4 and 6 players'; }
    if (this.roundNumber < maxCardsPerPlayer) {
      this.numberOfCards = this.roundNumber;
      this.stage = RoundStage.ASC;
    } else if (this.roundNumber < maxCardsPerPlayer + numberOfPlayers) {
      this.numberOfCards = maxCardsPerPlayer;
      this.stage = RoundStage.NO_TRUMPS;
    } else {
      this.numberOfCards = (2 * (maxCardsPerPlayer - 1) + numberOfPlayers) - this.roundNumber + 1;
      this.stage = RoundStage.DESC;
    }
  }

  isLastRound(): boolean {
    return this.numberOfCards === 1 && this.stage === RoundStage.DESC;
  }

  hasTrumps(): boolean {
    return this.stage !== RoundStage.NO_TRUMPS;
  }

  generateCards() {

  }

  static createNewRound(game: Game): Round {
    const round = new Round(game);
    round.initRound();
    round.generateCards();
    round.game.rounds.push(round);
    return round;
  }
}
