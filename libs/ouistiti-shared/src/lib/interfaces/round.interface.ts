import { CardInfo } from './card.interface';
import { RoundStatus } from '../enum/round-status.enum';
import { BreakPointInfo } from './break-point.interface';

// Client events

export interface RoundInfo {
  currentPlayerId: string;
  currentTurnNumber: number;
  playerOrder: string[];
  status: RoundStatus;
  cards: CardInfo[];
  bids: BidInfo;
  breakPoint?: BreakPointInfo;
}

export type BidInfo = { [key: string]: number };

export interface BidsChanged {
  bids: BidInfo;
  breakPoint: BreakPointInfo;
}

export interface CardPlayed {
  affectedCards: CardInfo[];
  nextPlayerId: string;
  breakPoint?: BreakPointInfo;
}

interface RoundStatusChangedToPlay extends BidsChanged {
  status: RoundStatus.PLAY
}

interface RoundStatusChangedToCompleted {
  status: RoundStatus.COMPLETED
}

export interface NewTurnStarted {
  newTurnNumber: number;
  newTurnFirstPlayerId: string;
}

export type RoundStatusChanged = RoundStatusChangedToPlay | RoundStatusChangedToCompleted;

// Server events

export interface PlaceBidParams {
  bid: number;
}

export interface PlayCardParams {
  id: string;
}
