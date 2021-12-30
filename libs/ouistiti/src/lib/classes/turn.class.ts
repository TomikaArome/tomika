import { Card } from './card.class';
import { Player } from './player.class';
import { Round } from './round.class';
import { CardSuit } from '@TomikaArome/ouistiti-shared';

export class Turn {
  round: Round;
  playedCards: Card[] = [];
  startingPlayer: Player;

  constructor(round: Round) {
    this.round = round;
  }

  get trumpSuit(): CardSuit {
    return this.round.trumpCard?.suit || null;
  }

  get winningCard(): Card {
    return this.playedCards.reduce((winningCard, currentCard) => {
      if (winningCard === null) { return currentCard; }
      else if (winningCard.suit === currentCard.suit) {
        return winningCard.compareTo(currentCard) > 0 ? winningCard : currentCard;
      }
      else if (winningCard.suit !== this.trumpSuit && currentCard.suit === this.trumpSuit) { return currentCard; }
      else { return winningCard; }
    }, null);
  }
}
