import { GameStatus, LobbyInfo, PlayerColour, PlayerSymbol } from '@TomikaArome/ouistiti-shared';

export const lobby1Mock: LobbyInfo = {
  passwordProtected: true,
  maxNumberOfPlayers: 4,
  gameStatus: GameStatus.IN_PROGRESS,
  players: [
    {
      id: 'AXP9aX7pRuHZH1a1Bi_Sf',
      nickname: 'Thomas',
      colour: PlayerColour.AQUA,
      symbol: PlayerSymbol.SPADE
    },
    {
      id: 'So5DdHmXOR7YoDnDeMBPC',
      nickname: 'Steve',
      colour: PlayerColour.RED,
      symbol: PlayerSymbol.CLUB
    },
    {
      id: '5x89SitQIGwno_mUWhqG6',
      nickname: 'Claire',
      colour: PlayerColour.GREEN,
      symbol: PlayerSymbol.DIAMOND
    },
    {
      id: 'ne6NF08aL2caTuk3c34rX',
      nickname: 'David',
      colour: PlayerColour.BLUE,
      symbol: PlayerSymbol.SPADE
    }
  ],
  hostId: 'AXP9aX7pRuHZH1a1Bi_Sf',
  currentRoundNumber: 5,
  totalRoundCount: 18
};

export const lobby2Mock: LobbyInfo = {
  passwordProtected: false,
  maxNumberOfPlayers: 6,
  gameStatus: GameStatus.INIT,
  players: [
    {
      id: 'IqqU4-U37aEv_IaMz-SR3',
      nickname: 'Jon',
      colour: PlayerColour.PINK,
      symbol: PlayerSymbol.CLUB
    }
  ],
  hostId: 'IqqU4-U37aEv_IaMz-SR3'
}

export const lobbyListMock = [
  lobby1Mock,
  lobby2Mock
];
