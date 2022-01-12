import { CardInfo } from './card.interface';

// Client events

export interface RoundInfo {
  currentPlayerId: string;
  cards: CardInfo[];
  bids: BidInfo[];
}

export interface UnknownBidInfo {
  playerId: string;
  bidPending: boolean;
}

export interface KnownBidInfo {
  playerId: string;
  bid: number;
}

export type BidInfo = UnknownBidInfo | KnownBidInfo;

// Server events

export interface BidParams {
  bid: number;
}
