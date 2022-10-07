import { CardSuit } from '../enum/card-suit.enum';
import { CardValue } from '../enum/card-value.enum';
import { BidInfo, RoundInfo } from '../interfaces/round.interface';
import { CardInfo, TrumpCardInfo } from '../interfaces/card.interface';
import { RoundStatus } from '../enum/round-status.enum';

const cards: CardInfo[] = [
  {
    id: 'Bbcd9Mzix4',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.QUEEN,
    suit: CardSuit.DIAMOND,
  },
  {
    id: 'Z8gC1ec1nc',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: 'gCPt2jgLIX',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'fM515hYyUL',
    ownerId: '5x89SitQIG',
  },
  {
    id: '5HuyladsSI',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.JACK,
    suit: CardSuit.DIAMOND,
  },
  {
    id: 'SolOuePHP2',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: '_vbpgIZxGK',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'MfYrSJKJHb',
    ownerId: '5x89SitQIG',
  },
  {
    id: 'NHqQ_BCfgK',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.SEVEN,
    suit: CardSuit.SPADE,
  },
  {
    id: 'ttm-xgGO6y',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: 'wklXxOEQs6',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'w84MulYIza',
    ownerId: '5x89SitQIG',
  },
  {
    id: '_N3FCoJ1Xd',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.QUEEN,
    suit: CardSuit.CLUB,
  },
  {
    id: 'h8wyp33OyY',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: 'neHLUUmc6g',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'nEZ_DcoAnJ',
    ownerId: '5x89SitQIG',
  },
  {
    id: '7jN0SynuUQ',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.EIGHT,
    suit: CardSuit.DIAMOND,
  },
  {
    id: '454E1qPbNK',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: '9IOAq1geXH',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'VRJQQeZN1-',
    ownerId: '5x89SitQIG',
  },
  {
    id: 'Abu9TRM-2p',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.KING,
    suit: CardSuit.DIAMOND,
  },
  {
    id: '1SlRsfeNg-',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: '8YHHxf8yTo',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'fN2IpmzpOc',
    ownerId: '5x89SitQIG',
  },
];

const moreCards: CardInfo[] = [
  {
    id: 'EnCRcV09Ww',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.EIGHT,
    suit: CardSuit.SPADE,
  },
  {
    id: 'BxyU3fXY0v',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: 'JCn74fWDaq',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'cKW4dEhD5F',
    ownerId: '5x89SitQIG',
  },
  {
    id: 'DOnkMYog0F',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.KING,
    suit: CardSuit.SPADE,
  },
  {
    id: 'L2Aa3eJ_ty',
    ownerId: 'So5DdHmXOR',
  },
  {
    id: 'w-VJsHKwu0',
    ownerId: 'ne6NF08aL2',
  },
  {
    id: 'ioN8q-BnEW',
    ownerId: '5x89SitQIG',
  },
];

const wonCards: CardInfo[] = [
  {
    id: 'EnCRcV09Ww',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.EIGHT,
    suit: CardSuit.SPADE,
    playedOnTurn: 1,
    playedOrderPosition: 1,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'BxyU3fXY0v',
    ownerId: 'So5DdHmXOR',
    playedOnTurn: 1,
    playedOrderPosition: 2,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'JCn74fWDaq',
    ownerId: 'ne6NF08aL2',
    playedOnTurn: 1,
    playedOrderPosition: 3,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'cKW4dEhD5F',
    ownerId: '5x89SitQIG',
    playedOnTurn: 1,
    playedOrderPosition: 4,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'DOnkMYog0F',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.KING,
    suit: CardSuit.SPADE,
    playedOnTurn: 2,
    playedOrderPosition: 1,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'L2Aa3eJ_ty',
    ownerId: 'So5DdHmXOR',
    playedOnTurn: 2,
    playedOrderPosition: 2,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'w-VJsHKwu0',
    ownerId: 'ne6NF08aL2',
    playedOnTurn: 2,
    playedOrderPosition: 3,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'ioN8q-BnEW',
    ownerId: '5x89SitQIG',
    playedOnTurn: 2,
    playedOrderPosition: 4,
    winnerId: 'AXP9aX7pRu',
  },
];

const playedCards: CardInfo[] = [
  {
    id: 'EnCRcV09Ww',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.EIGHT,
    suit: CardSuit.SPADE,
    playedOnTurn: 1,
    playedOrderPosition: 1,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'BxyU3fXY0v',
    ownerId: 'So5DdHmXOR',
    playedOnTurn: 1,
    playedOrderPosition: 2,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'JCn74fWDaq',
    ownerId: 'ne6NF08aL2',
    playedOnTurn: 1,
    playedOrderPosition: 3,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'cKW4dEhD5F',
    ownerId: '5x89SitQIG',
    playedOnTurn: 1,
    playedOrderPosition: 4,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'DOnkMYog0F',
    ownerId: 'AXP9aX7pRu',
    value: CardValue.EIGHT,
    suit: CardSuit.HEART,
    playedOnTurn: 2,
    playedOrderPosition: 1,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'L2Aa3eJ_ty',
    ownerId: 'So5DdHmXOR',
    value: CardValue.ACE,
    suit: CardSuit.SPADE,
    playedOnTurn: 2,
    playedOrderPosition: 2,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'w-VJsHKwu0',
    ownerId: 'ne6NF08aL2',
    value: CardValue.NINE,
    suit: CardSuit.CLUB,
    playedOnTurn: 2,
    playedOrderPosition: 4,
    winnerId: 'AXP9aX7pRu',
  },
  {
    id: 'ioN8q-BnEW',
    ownerId: '5x89SitQIG',
    value: CardValue.QUEEN,
    suit: CardSuit.HEART,
    playedOnTurn: 2,
    playedOrderPosition: 3,
    winnerId: 'AXP9aX7pRu',
  },
];

const trumpCard: TrumpCardInfo = {
  id: 'DOnkMYog0F',
  isTrumpCard: true,
  value: CardValue.KING,
  suit: CardSuit.SPADE,
};

const bids: BidInfo = {
  AXP9aX7pRu: 2,
  So5DdHmXOR: 0,
  ne6NF08aL2: 8,
};

export const roundStatusMock: RoundInfo = {
  number: 8,
  status: RoundStatus.BIDDING,
  breakPoint: null,
  currentPlayerId: 'AXP9aX7pRu',
  currentTurnNumber: 2,
  playerOrder: ['AXP9aX7pRu', 'So5DdHmXOR', 'ne6NF08aL2', '5x89SitQIG'],
  cards: [...cards, ...playedCards],
  bids: bids,
};
