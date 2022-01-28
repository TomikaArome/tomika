import { Card } from '../classes/card.class';

export interface BidPlacedObserved {
  playerId: string;
  bid: number;
}

export interface BidCancelledObserved {
  playerId: string;
}

export interface CardPlayedObserved {
  affectedCards: Card[];
  nextPlayerId: string;
}

export interface NewTurnStartedObserved {
  newTurnNumber: number;
  newTurnFirstPlayerId: string;
}
