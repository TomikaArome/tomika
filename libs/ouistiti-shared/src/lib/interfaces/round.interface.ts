import { CardInfo, PlayedCardInfo } from './card.interface';
import { RoundStatus } from '../enum/round-status.enum';

// Client events

export interface RoundInfo {
  currentPlayerId: string;
  currentTurnNumber: number;
  playerOrder: string[];
  status: RoundStatus;
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

interface RoundStatusChangedToPlay {
  status: RoundStatus.PLAY,
  finalBids: KnownBidInfo[]
}

interface RoundStatusChangedToCompleted {
  status: RoundStatus.COMPLETED
}

export type RoundStatusChanged = RoundStatusChangedToPlay | RoundStatusChangedToCompleted;

// Server events

export interface BidParams {
  bid: number;
}

// Type guard checks

export function isKnownBidInfo(obj: BidInfo): obj is KnownBidInfo {
  return typeof obj === 'object' && (obj as KnownBidInfo).bid !== undefined;
}
