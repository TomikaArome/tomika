import { CardInfo, PlayedCardInfo } from './card.interface';
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
  card: PlayedCardInfo;
  nextPlayerId: string;
}

interface RoundStatusChangedToPlay extends BidsChanged {
  status: RoundStatus.PLAY
}

interface RoundStatusChangedToCompleted {
  status: RoundStatus.COMPLETED
}

export type RoundStatusChanged = RoundStatusChangedToPlay | RoundStatusChangedToCompleted;

// Server events

export interface BidParams {
  bid: number;
}
