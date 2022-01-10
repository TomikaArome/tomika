import { CardSuit, CardValue } from '@TomikaArome/ouistiti-shared';

export interface TrumpCardInfo {
  id: string;
  isTrumpCard: true;
  value: CardValue;
  suit: CardSuit;
}

export interface UnownedCardInfo {
  id: string;
}

export interface OwnedAndUnknownCardInfo {
  id: string;
  ownerId: string;
  played: false;
}

export interface OwnedAndKnownCardInfo extends OwnedAndUnknownCardInfo {
  value: CardValue;
  suit: CardSuit;
}

export interface PlayedCardInfo {
  id: string;
  ownerId: string;
  value: CardValue;
  suit: CardSuit;
  played: true;
  playedOnTurn: number;
  playedOrderPosition: number;
}

export interface WonCardInfo extends PlayedCardInfo {
  winnerId: string;
}

export type CardInfo = TrumpCardInfo | UnownedCardInfo | OwnedAndUnknownCardInfo | OwnedAndKnownCardInfo | PlayedCardInfo | WonCardInfo;
