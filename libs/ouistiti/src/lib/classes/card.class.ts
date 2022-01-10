import { Player } from './player.class';
import { CARD_ORDER, CardSuit, CardValue } from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';

export class Card {
  id = nanoid(10);
  value: CardValue;
  suit: CardSuit;
  owner: Player;
  played = false;

  constructor(value: CardValue, suit: CardSuit) {
    this.value = value;
    this.suit = suit;
  }

  compareTo(otherCard: Card): number {
    return CARD_ORDER.indexOf(this.value) - CARD_ORDER.indexOf(otherCard.value);
  }

  static generateUnshuffledDeck(totalNumberOfCards: number): Card[] {
    let i = totalNumberOfCards;
    return CARD_ORDER.reduceRight((accumulatedCards, currentValue) => {
      Object.values(CardSuit).forEach((currentSuit) => {
        if (i > 0) {
          accumulatedCards.push(new Card(currentValue, currentSuit));
          i--;
        }
      });
      return accumulatedCards;
    }, []);
  }
}
