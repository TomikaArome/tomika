import { CardInfo } from './card.interface';

// Client events

export interface RoundInfo {
  currentPlayerId: string;
  cards: CardInfo[];
  bids: BidInfo[];
}

export interface BidInfo {
  playerId: string;
  waitingForBid: boolean;
  bid?: number;
}

// Server events

export interface BidParams {
  bid: number;
}
