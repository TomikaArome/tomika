import { Card } from '../classes/card.class';

export interface CardPlayedObserved {
  card: Card;
  nextPlayerId?: string;
}
