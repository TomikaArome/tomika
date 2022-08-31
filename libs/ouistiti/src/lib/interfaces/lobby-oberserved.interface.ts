import { Player } from '../classes/player.class';

export interface LobbyJoinObserved {
  player: Player;
  order: string[];
}

export interface LobbyLeftObserved {
  player: Player;
  newHost?: Player;
  order: string[];
}

export interface LobbyChangedHostObserved {
  previousHost: Player;
  newHost: Player;
}
