import { CardSuit } from '../enum/card-suit.enum';
import { CardValue } from '../enum/card-value.enum';

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

export type OwnedAndKnownCardInfo = OwnedAndUnknownCardInfo &
  UnownedAndKnownCardInfo;

export interface PlayedCardInfo extends OwnedAndKnownCardInfo {
  playedOnTurn: number;
  playedOrderPosition: number;
}

export interface WonCardInfo extends PlayedCardInfo {
  winnerId: string;
}

export type UnknownCardInfo =
  | UnownedAndUnknownCardInfo
  | OwnedAndUnknownCardInfo;
export type KnownCardInfo =
  | UnownedAndKnownCardInfo
  | TrumpCardInfo
  | OwnedAndKnownCardInfo
  | PlayedCardInfo
  | WonCardInfo;

export type CardInfo = UnknownCardInfo | KnownCardInfo;

// Type guard checks

export function isTrumpCardInfo(obj: CardInfo): obj is TrumpCardInfo {
  return (obj as TrumpCardInfo).isTrumpCard === true;
}

export function isWonCardInfo(obj: CardInfo): obj is WonCardInfo {
  return (obj as WonCardInfo).winnerId !== undefined;
}

export function isPlayedCardInfo(obj: CardInfo): obj is PlayedCardInfo {
  const playedCard = obj as PlayedCardInfo;
  return (
    playedCard.playedOnTurn !== undefined &&
    playedCard.playedOrderPosition !== undefined
  );
}

export function isOwnedAndKnownCardInfo(
  obj: CardInfo
): obj is OwnedAndKnownCardInfo {
  return (obj as OwnedAndKnownCardInfo).ownerId !== undefined;
}
