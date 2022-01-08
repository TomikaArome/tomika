import { GameStatus } from '../enum/game-status.enum';
import { LobbyInfo, LobbyStatus } from '../interfaces/lobby.interface';
import { PlayerColour } from '../enum/player-colour.enum';
import { PlayerSymbol } from '../enum/player-symbol.enum';

export const lobby1Mock: LobbyInfo = {
  id: 'ZqgqKiD3vUeYpQYTUQGj_',
  passwordProtected: true,
  maxNumberOfPlayers: 4,
  gameStatus: GameStatus.IN_PROGRESS,
  players: [
    {
      id: 'AXP9aX7pRuHZH1a1Bi_Sf',
      nickname: 'Thomas',
      colour: PlayerColour.AQUA,
      symbol: PlayerSymbol.SPADE,
      vacant: false
    },
    {
      id: 'So5DdHmXOR7YoDnDeMBPC',
      nickname: 'Steve',
      colour: PlayerColour.RED,
      symbol: PlayerSymbol.CLUB,
      vacant: false
    },
    {
      id: '5x89SitQIGwno_mUWhqG6',
      nickname: 'Claire',
      colour: PlayerColour.GREEN,
      symbol: PlayerSymbol.DIAMOND,
      vacant: false
    },
    {
      id: 'ne6NF08aL2caTuk3c34rX',
      nickname: 'David',
      colour: PlayerColour.BLUE,
      symbol: PlayerSymbol.SPADE,
      vacant: false
    }
  ],
  playerOrder: [
    'So5DdHmXOR7YoDnDeMBPC',
    'ne6NF08aL2caTuk3c34rX',
    'AXP9aX7pRuHZH1a1Bi_Sf',
    '5x89SitQIGwno_mUWhqG6'
  ],
  hostId: 'AXP9aX7pRuHZH1a1Bi_Sf',
  currentRoundNumber: 5,
  totalRoundCount: 18
};

export const lobby2Mock: LobbyInfo = {
  id: 'pFcH1u_ul-sF_l6VtFcuh',
  passwordProtected: false,
  maxNumberOfPlayers: 6,
  gameStatus: GameStatus.INIT,
  players: [
    {
      id: 'IqqU4-U37aEv_IaMz-SR3',
      nickname: 'Jon',
      colour: PlayerColour.PINK,
      symbol: PlayerSymbol.CLUB,
      vacant: false
    }
  ],
  playerOrder: [
    'IqqU4-U37aEv_IaMz-SR3'
  ],
  hostId: 'IqqU4-U37aEv_IaMz-SR3'
}

export const lobby3Mock: LobbyInfo = {
  id: '6DK77-nQPuIPtpKsnJELJ',
  passwordProtected: true,
  maxNumberOfPlayers: 8,
  gameStatus: GameStatus.SUSPENDED,
  players: [
    {
      id: '3_qFtX8jK-0KvM_KK61tc',
      nickname: 'Madeline',
      colour: PlayerColour.RED,
      symbol: PlayerSymbol.DIAMOND,
      vacant: false
    },
    {
      id: 'NEnVNgoucJlfqCs3a51H7',
      nickname: 'Celia',
      colour: PlayerColour.GREEN,
      symbol: PlayerSymbol.HEART,
      vacant: true
    }
  ],
  playerOrder: [
    '3_qFtX8jK-0KvM_KK61tc',
    'NEnVNgoucJlfqCs3a51H7'
  ],
  hostId: '3_qFtX8jK-0KvM_KK61tc',
  currentRoundNumber: 13,
  totalRoundCount: 18
}

export const lobbyListMock: LobbyInfo[] = [
  lobby1Mock,
  lobby2Mock,
  lobby3Mock
];

export const lobbyStatusPlayerIsHostMock: LobbyStatus = {
  inLobby: true,
  lobby: lobby1Mock,
  playerId: 'AXP9aX7pRuHZH1a1Bi_Sf'
}

export const lobbyStatusPlayerIsNotHostMock: LobbyStatus = {
  inLobby: true,
  lobby: lobby1Mock,
  playerId: '5x89SitQIGwno_mUWhqG6'
}
