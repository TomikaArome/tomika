import { CardSuit } from '../enum/card-suit.enum';
import { RoundScores } from '../interfaces/round.interface';

const defaultPlayerIds = [
  '41fb-BS1I3',
  '8mk8HmaF3y',
  'yfcw75pt8r',
  'C_r83VNGVt',
];

export const getGameScoresMock = (playerIds: string[] = []): RoundScores[] => {
  if (!playerIds[0]) {
    playerIds[0] = defaultPlayerIds[0];
  }
  if (!playerIds[1]) {
    playerIds[1] = defaultPlayerIds[1];
  }
  if (!playerIds[2]) {
    playerIds[2] = defaultPlayerIds[2];
  }
  if (!playerIds[3]) {
    playerIds[3] = defaultPlayerIds[3];
  }

  const completeGame: RoundScores[] = [
    {
      knownTrump: true,
      roundNumber: 1,
      startingPlayerId: playerIds[0],
      numberOfCards: 1,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[1],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[2],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.CLUB,
    },
    {
      knownTrump: true,
      roundNumber: 2,
      startingPlayerId: playerIds[1],
      numberOfCards: 2,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 0,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 2,
          tricksWon: 2,
          pointDifference: 12,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.HEART,
    },
    {
      knownTrump: true,
      roundNumber: 3,
      startingPlayerId: playerIds[2],
      numberOfCards: 3,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[2],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.CLUB,
    },
    {
      knownTrump: true,
      roundNumber: 4,
      startingPlayerId: playerIds[3],
      numberOfCards: 4,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 0,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 2,
          tricksWon: 3,
          pointDifference: -1,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.HEART,
    },
    {
      knownTrump: true,
      roundNumber: 5,
      startingPlayerId: playerIds[0],
      numberOfCards: 5,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 2,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 0,
          tricksWon: 2,
          pointDifference: -2,
        },
        {
          playerId: playerIds[2],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.SPADE,
    },
    {
      knownTrump: true,
      roundNumber: 6,
      startingPlayerId: playerIds[1],
      numberOfCards: 6,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 2,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[3],
          bid: 2,
          tricksWon: 2,
          pointDifference: 12,
        },
      ],
      trump: CardSuit.CLUB,
    },
    {
      knownTrump: true,
      roundNumber: 7,
      startingPlayerId: playerIds[2],
      numberOfCards: 7,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 2,
          pointDifference: 12,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[2],
          bid: 3,
          tricksWon: 3,
          pointDifference: 13,
        },
        {
          playerId: playerIds[3],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
      ],
      trump: CardSuit.HEART,
    },
    {
      knownTrump: true,
      roundNumber: 8,
      startingPlayerId: playerIds[3],
      numberOfCards: 8,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 2,
          pointDifference: 12,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[2],
          bid: 4,
          tricksWon: 4,
          pointDifference: 14,
        },
        {
          playerId: playerIds[3],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
      ],
    },
    {
      knownTrump: true,
      roundNumber: 9,
      startingPlayerId: playerIds[0],
      numberOfCards: 8,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 2,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 2,
          tricksWon: 2,
          pointDifference: 12,
        },
        {
          playerId: playerIds[2],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[3],
          bid: 2,
          tricksWon: 3,
          pointDifference: -1,
        },
      ],
    },
    {
      knownTrump: true,
      roundNumber: 10,
      startingPlayerId: playerIds[1],
      numberOfCards: 8,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 2,
          pointDifference: 12,
        },
        {
          playerId: playerIds[1],
          bid: 3,
          tricksWon: 4,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[3],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
      ],
    },
    {
      knownTrump: true,
      roundNumber: 11,
      startingPlayerId: playerIds[2],
      numberOfCards: 8,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 2,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[2],
          bid: 3,
          tricksWon: 3,
          pointDifference: 13,
        },
        {
          playerId: playerIds[3],
          bid: 3,
          tricksWon: 3,
          pointDifference: 13,
        },
      ],
    },
    {
      knownTrump: true,
      roundNumber: 12,
      startingPlayerId: playerIds[3],
      numberOfCards: 7,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[3],
          bid: 3,
          tricksWon: 4,
          pointDifference: -1,
        },
      ],
      trump: CardSuit.HEART,
    },
    {
      knownTrump: true,
      roundNumber: 13,
      startingPlayerId: playerIds[0],
      numberOfCards: 6,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[1],
          bid: 3,
          tricksWon: 2,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[3],
          bid: 3,
          tricksWon: 3,
          pointDifference: 13,
        },
      ],
      trump: CardSuit.CLUB,
    },
    {
      knownTrump: true,
      roundNumber: 14,
      startingPlayerId: playerIds[1],
      numberOfCards: 5,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[1],
          bid: 2,
          tricksWon: 3,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.CLUB,
    },
    {
      knownTrump: true,
      roundNumber: 15,
      startingPlayerId: playerIds[2],
      numberOfCards: 4,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 3,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[2],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 1,
          pointDifference: -1,
        },
      ],
      trump: CardSuit.SPADE,
    },
    {
      knownTrump: true,
      roundNumber: 16,
      startingPlayerId: playerIds[3],
      numberOfCards: 3,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 2,
          tricksWon: 1,
          pointDifference: -1,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 2,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.DIAMOND,
    },
    {
      knownTrump: true,
      roundNumber: 17,
      startingPlayerId: playerIds[0],
      numberOfCards: 2,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[2],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.SPADE,
    },
    {
      knownTrump: true,
      roundNumber: 18,
      startingPlayerId: playerIds[1],
      numberOfCards: 1,
      playerScores: [
        {
          playerId: playerIds[0],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
        {
          playerId: playerIds[1],
          bid: 1,
          tricksWon: 0,
          pointDifference: -1,
        },
        {
          playerId: playerIds[2],
          bid: 1,
          tricksWon: 1,
          pointDifference: 11,
        },
        {
          playerId: playerIds[3],
          bid: 0,
          tricksWon: 0,
          pointDifference: 10,
        },
      ],
      trump: CardSuit.HEART,
    },
  ];
  const incompleteGame: RoundScores[] = completeGame.map((roundScore) => {
    return roundScore.roundNumber <= 14
      ? roundScore
      : {
          ...roundScore,
          playerScores: roundScore.playerScores.map((playerScore) => {
            return { playerId: playerScore.playerId };
          }),
          knownTrump: roundScore.numberOfCards === 8,
        };
  });
  return incompleteGame;
};
