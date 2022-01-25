import { Card } from '../classes/card.class';

export interface BidPlacedObserved {
  playerId: string;
  bid: number;
}

export interface BidCancelledObserved {
  playerId: string;
}

export interface CardPlayedObserved {
  card: Card;
  nextPlayerId?: string;
}
