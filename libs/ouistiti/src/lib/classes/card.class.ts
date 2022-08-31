import {
  CARD_ORDER,
  CardSuit,
  CardValue,
  KnownCardInfo,
  OwnedAndUnknownCardInfo,
  PlayedCardInfo,
  UnknownCardInfo,
  WonCardInfo,
} from '@TomikaArome/ouistiti-shared';
import { nanoid } from 'nanoid';

export class Card {
  id = nanoid(10);

  ownerId: string;
  playedOnTurn = 0;
  playedOrderPosition = 0;
  winnerId: string;

  get played(): boolean {
    return this.playedOnTurn > 0 && this.playedOrderPosition > 0;
  }

  get incompleteInfo(): UnknownCardInfo {
    let info: UnknownCardInfo = { id: this.id };
    if (this.ownerId) {
      info = { ...info, ownerId: this.ownerId } as OwnedAndUnknownCardInfo;
      if (this.played) {
        info = {
          ...info,
          playedOnTurn: this.playedOnTurn,
          playedOrderPosition: this.playedOrderPosition,
        } as PlayedCardInfo;
        if (this.winnerId) {
          info = { ...info, winnerId: this.winnerId } as WonCardInfo;
        }
      }
    }
    return info;
  }

  get info(): KnownCardInfo {
    return {
      ...this.incompleteInfo,
      value: this.value,
      suit: this.suit,
    };
  }

  constructor(public value: CardValue, public suit: CardSuit) {}

  compareByValue(otherCard: Card): number {
    return CARD_ORDER.indexOf(this.value) - CARD_ORDER.indexOf(otherCard.value);
  }

  compareByPlayedOrderPosition(otherCard: Card): number {
    return this.playedOrderPosition - otherCard.playedOrderPosition;
  }

  static generateUnshuffledDeck(totalNumberOfCards: number): Card[] {
    let i = totalNumberOfCards;
    return CARD_ORDER.reduceRight((accumulatedCards, currentValue) => {
      if (i > 0) {
        Object.values(CardSuit).forEach((currentSuit) => {
          if (i > 0) {
            accumulatedCards.push(new Card(currentValue, currentSuit));
            i--;
          }
        });
      }
      return accumulatedCards;
    }, []);
  }
}
