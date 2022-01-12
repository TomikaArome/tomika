import { GameStatus } from '../enum/game-status.enum';
import { LobbyInfo, LobbyStatus } from '../interfaces/lobby.interface';
import { PlayerColour } from '../enum/player-colour.enum';
import { PlayerSymbol } from '../enum/player-symbol.enum';

export const lobby1Mock: LobbyInfo = {
  id: 'ZqgqKiD3vU',
  passwordProtected: true,
  maxNumberOfPlayers: 4,
  gameStatus: GameStatus.IN_PROGRESS,
  players: [
    {
      id: 'AXP9aX7pRu',
      nickname: 'Thomas',
      colour: PlayerColour.AQUA,
      symbol: PlayerSymbol.SPADE,
      vacant: false
    },
    {
      id: 'So5DdHmXOR',
      nickname: 'Steve',
      colour: PlayerColour.RED,
      symbol: PlayerSymbol.CLUB,
      vacant: false
    },
    {
      id: '5x89SitQIG',
      nickname: 'Claire',
      colour: PlayerColour.GREEN,
      symbol: PlayerSymbol.DIAMOND,
      vacant: false
    },
    {
      id: 'ne6NF08aL2',
      nickname: 'David',
      colour: PlayerColour.BLUE,
      symbol: PlayerSymbol.SPADE,
      vacant: false
    }
  ],
  playerOrder: [
    'So5DdHmXOR',
    'ne6NF08aL2',
    'AXP9aX7pRu',
    '5x89SitQIG'
  ],
  hostId: 'AXP9aX7pRu',
  currentRoundNumber: 5,
  totalRoundCount: 18
};

export const lobby2Mock: LobbyInfo = {
  id: 'pFcH1u_ul-',
  passwordProtected: false,
  maxNumberOfPlayers: 6,
  gameStatus: GameStatus.INIT,
  players: [
    {
      id: 'IqqU4-U37a',
      nickname: 'Jon',
      colour: PlayerColour.PINK,
      symbol: PlayerSymbol.CLUB,
      vacant: false
    }
  ],
  playerOrder: [
    'IqqU4-U37a'
  ],
  hostId: 'IqqU4-U37a'
}

export const lobby3Mock: LobbyInfo = {
  id: '6DK77-nQPu',
  passwordProtected: true,
  maxNumberOfPlayers: 8,
  gameStatus: GameStatus.SUSPENDED,
  players: [
    {
      id: '3_qFtX8jK-',
      nickname: 'Madeline',
      colour: PlayerColour.RED,
      symbol: PlayerSymbol.DIAMOND,
      vacant: false
    },
    {
      id: 'NEnVNgoucJ',
      nickname: 'Celia',
      colour: PlayerColour.GREEN,
      symbol: PlayerSymbol.HEART,
      vacant: true
    }
  ],
  playerOrder: [
    '3_qFtX8jK-',
    'NEnVNgoucJ'
  ],
  hostId: '3_qFtX8jK-',
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
  playerId: 'AXP9aX7pRu'
}

export const lobbyStatusPlayerIsNotHostMock: LobbyStatus = {
  inLobby: true,
  lobby: lobby1Mock,
  playerId: '5x89SitQIG'
}
