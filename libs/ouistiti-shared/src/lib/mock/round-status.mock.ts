import { CardSuit } from '../enum/card-suit.enum';
import { CardValue } from '../enum/card-value.enum';
import { RoundInfo } from '../interfaces/round.interface';

export const roundStatusMock: RoundInfo = {
  currentPlayerId: "AXP9aX7pRu",
  currentTurnNumber: 1,
  playerOrder: [
    'AXP9aX7pRu',
    'So5DdHmXOR',
    'ne6NF08aL2',
    '5x89SitQIG'
  ],
  cards: [
    {
      id: "Bbcd9Mzix4",
      ownerId: "AXP9aX7pRu",
      value: CardValue.QUEEN,
      suit: CardSuit.DIAMOND
    },
    {
      id: "Z8gC1ec1nc",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "gCPt2jgLIX",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "fM515hYyUL",
      ownerId: "5x89SitQIG"
    },
    {
      id: "5HuyladsSI",
      ownerId: "AXP9aX7pRu",
      value: CardValue.JACK,
      suit: CardSuit.DIAMOND
    },
    {
      id: "SolOuePHP2",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "_vbpgIZxGK",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "MfYrSJKJHb",
      ownerId: "5x89SitQIG"
    },
    {
      id: "NHqQ_BCfgK",
      ownerId: "AXP9aX7pRu",
      value: CardValue.SEVEN,
      suit: CardSuit.SPADE
    },
    {
      id: "ttm-xgGO6y",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "wklXxOEQs6",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "w84MulYIza",
      ownerId: "5x89SitQIG"
    },
    {
      id: "_N3FCoJ1Xd",
      ownerId: "AXP9aX7pRu",
      value: CardValue.QUEEN,
      suit: CardSuit.CLUB
    },
    {
      id: "h8wyp33OyY",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "neHLUUmc6g",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "nEZ_DcoAnJ",
      ownerId: "5x89SitQIG"
    },
    {
      id: "7jN0SynuUQ",
      ownerId: "AXP9aX7pRu",
      value: CardValue.EIGHT,
      suit: CardSuit.DIAMOND
    },
    {
      id: "454E1qPbNK",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "9IOAq1geXH",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "VRJQQeZN1-",
      ownerId: "5x89SitQIG"
    },
    {
      id: "Abu9TRM-2p",
      ownerId: "AXP9aX7pRu",
      value: CardValue.KING,
      suit: CardSuit.DIAMOND
    },
    {
      id: "1SlRsfeNg-",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "8YHHxf8yTo",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "fN2IpmzpOc",
      ownerId: "5x89SitQIG"
    },
    {
      id: "EnCRcV09Ww",
      ownerId: "AXP9aX7pRu",
      value: CardValue.EIGHT,
      suit: CardSuit.SPADE
    },
    {
      id: "BxyU3fXY0v",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "JCn74fWDaq",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "cKW4dEhD5F",
      ownerId: "5x89SitQIG"
    },
    {
      id: "DOnkMYog0F",
      ownerId: "AXP9aX7pRu",
      value: CardValue.KING,
      suit: CardSuit.SPADE
    },
    {
      id: "L2Aa3eJ_ty",
      ownerId: "So5DdHmXOR"
    },
    {
      id: "w-VJsHKwu0",
      ownerId: "ne6NF08aL2"
    },
    {
      id: "ioN8q-BnEW",
      ownerId: "5x89SitQIG"
    }
  ],
  bids: [
    {
      playerId: "AXP9aX7pRu",
      bidPending: true
    },
    {
      playerId: "So5DdHmXOR",
      bidPending: true
    },
    {
      playerId: "ne6NF08aL2",
      bidPending: true
    },
    {
      playerId: "5x89SitQIG",
      bidPending: true
    }
  ]
};
