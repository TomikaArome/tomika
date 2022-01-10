import { CardInfo } from './card.interface';

// Client events

export interface RoundInfo {
  currentPlayerId: string;
  cards: CardInfo[];
  bids: BidInfo[];
}

export interface PendingBidInfo {
  playerId: string;
  bidPending: true;
}

export interface ResolvedBidInfo {
  playerId: string;
  bid: number;
}

export type BidInfo = PendingBidInfo | ResolvedBidInfo;

// Server events

export interface BidParams {
  bid: number;
}
