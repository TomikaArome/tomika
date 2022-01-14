import { CardInfo, PlayedCardInfo } from './card.interface';

// Client events

export interface RoundInfo {
  currentPlayerId: string;
  currentTurnNumber: number;
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

export interface CardPlayed {
  card: PlayedCardInfo;
  nextPlayerId: string;
}

// Server events

export interface BidParams {
  bid: number;
}

// Type guard checks

export function isKnownBidInfo(obj: BidInfo): obj is KnownBidInfo {
  return (obj as KnownBidInfo).bid !== undefined;
}
