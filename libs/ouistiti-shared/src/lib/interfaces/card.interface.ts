import { CardSuit, CardValue } from '@TomikaArome/ouistiti-shared';

export interface UnownedAndUnknownCardInfo {
  id: string;
}

export interface UnownedAndKnownCardInfo extends UnownedAndUnknownCardInfo {
  value: CardValue;
  suit: CardSuit;
}

export interface TrumpCardInfo extends UnownedAndKnownCardInfo {
  isTrumpCard: true;
}

export interface OwnedAndUnknownCardInfo extends UnownedAndUnknownCardInfo {
  ownerId: string;
}

export type OwnedAndKnownCardInfo = OwnedAndUnknownCardInfo & UnownedAndKnownCardInfo;

export interface PlayedCardInfo extends OwnedAndKnownCardInfo {
  playedOnTurn: number;
  playedOrderPosition: number;
}

export interface WonCardInfo extends PlayedCardInfo {
  winnerId: string;
}

export type UnknownCardInfo = UnownedAndUnknownCardInfo | OwnedAndUnknownCardInfo;
export type KnownCardInfo = UnownedAndKnownCardInfo | TrumpCardInfo | OwnedAndKnownCardInfo | PlayedCardInfo | WonCardInfo;

export type CardInfo = UnknownCardInfo | KnownCardInfo;
