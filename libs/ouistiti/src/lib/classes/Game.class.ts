import { nanoid } from 'nanoid';
import { Round } from './Round.class';
import { Lobby } from './Lobby.class';
import { Player } from './Player.class';
import { GameStatus } from '@TomikaArome/ouistiti-shared';



export class Game {
  id: string;
  lobby: Lobby;
  status: GameStatus = GameStatus.INIT;
  rounds: Round[] = [];
  private playerOrder: string[];

  constructor(lobby: Lobby, existingId: string = null) {
    this.lobby = lobby;
    if (existingId) {
      this.loadExistingGame(existingId);
    } else {
      this.id = 'ouistiti-game-' + nanoid();
      this.newRound();
    }
  }

  get currentRound(): Round {
    return this.rounds[this.rounds.length - 1] ?? null;
  }

  get totalRoundCount(): number {
    const maxCardsPerPlayer = 8;
    return (maxCardsPerPlayer - 1) * 2 + this.lobby.players.length;
  }

  get playersInOrder(): Player[] {
    return this.playerOrder.map(playerId => this.lobby.getPlayerFromId(playerId));
  }

  loadExistingGame(id: string) {
    // TODO
  }

  newRound() {
    if (this.currentRound?.isLastRound()) {
      this.status = GameStatus.COMPLETED;
    } else {
      Round.createNewRound(this);
    }
  }
}