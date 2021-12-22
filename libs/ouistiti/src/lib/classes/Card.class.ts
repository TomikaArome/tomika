import { Player } from './Player.class';
import { CardSuit } from '@TomikaArome/ouistiti-shared';
import { CardValue } from '@TomikaArome/ouistiti-shared';

export class Card {
  value: CardValue;
  suit: CardSuit;
  owner: Player;
  played = false;

  constructor(value: CardValue, suit: CardSuit) {
    this.value = value;
    this.suit = suit;
  }

  compareTo(otherCard: Card): number {
    return Card.cardOrder.indexOf(this.value) - Card.cardOrder.indexOf(otherCard.value);
  }

  static cardOrder = [CardValue.TWO, CardValue.THREE, CardValue.FOUR, CardValue.FIVE, CardValue.SIX, CardValue.SEVEN,
    CardValue.EIGHT, CardValue.NINE, CardValue.TEN, CardValue.JACK, CardValue.QUEEN, CardValue.KING, CardValue.ACE];

  static generateUnshuffledDeck(totalNumberOfCards: number): Card[] {
    let i = totalNumberOfCards;
    return this.cardOrder.reduceRight((accumulatedCards, currentValue) => {
      Object.values(CardSuit).forEach((currentSuit) => {
        if (i > 0) {
          accumulatedCards.push(new Card(currentValue, currentSuit));
        }
        i--;
      });
      return accumulatedCards;
    }, []);
  }
}
