import { Player } from '../classes/player.class';

export interface LobbyLeftObserved {
  player: Player;
  newHost?: Player;
}

export interface LobbyChangedHostObserved {
  previousHost: Player;
  newHost: Player;
}
