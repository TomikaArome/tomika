import { CardInfo } from './card.interface';
import { RoundStatus } from '../enum/round-status.enum';
import { BreakPointInfo } from './break-point.interface';
import { CardSuit } from '../enum/card-suit.enum';

// Client events

export interface RoundInfo {
  number: number;
  status: RoundStatus;
  breakPoint: BreakPointInfo;
  currentPlayerId: string;
  currentTurnNumber: number;
  playerOrder: string[];
  cards: CardInfo[];
  bids: BidInfo;
}

interface RoundStatusChangedToBidding extends RoundInfo {
  status: RoundStatus.BIDDING;
}

export type BidInfo = { [key: string]: number };

export interface BidsChanged {
  breakPoint: BreakPointInfo;
  bids: BidInfo;
}

interface RoundStatusChangedToPlay {
  status: RoundStatus.PLAY;
  breakPoint: BreakPointInfo;
  bids?: BidInfo;
  newTurnNumber: number;
  newTurnFirstPlayerId: string;
}

export interface CardPlayed {
  breakPoint: BreakPointInfo;
  affectedCard: CardInfo;
  nextPlayerId: string;
}

interface RoundStatusChangedToEndOfTurn {
  status: RoundStatus.END_OF_TURN;
  breakPoint: BreakPointInfo;
  affectedCards: CardInfo[];
}

export interface RoundScores {
  roundNumber: number;
  numberOfCards: number;
  startingPlayerId: string;
  knownTrump: boolean;
  trump?: CardSuit;
  playerScores?: PlayerScore[];
}

export interface PlayerScore {
  playerId: string;
  bid?: number;
  tricksWon?: number;
  pointDifference?: number;
}

interface RoundStatusChangedToCompleted {
  status: RoundStatus.COMPLETED;
  breakPoint: BreakPointInfo;
  scores: RoundScores[];
}

export type RoundStatusChanged =
  | RoundStatusChangedToBidding
  | RoundStatusChangedToPlay
  | RoundStatusChangedToEndOfTurn
  | RoundStatusChangedToCompleted;

// Server events

export interface PlaceBidParams {
  bid: number;
}

export interface PlayCardParams {
  id: string;
}
