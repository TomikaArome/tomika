import { merge, MonoTypeOperatorFunction, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketController } from './socket.controller';
import { Game } from '../classes/game.class';
import { GameStatus } from '@TomikaArome/ouistiti-shared';
import { Round } from '../classes/round.class';
import { SocketRoundController } from './socket-round.controller';
import { SocketLobbyController } from './socket-lobby.controller';

export class SocketGameController {
  private gameEnded$ = new Subject<void>();
  stopIncludingGameCompleted$ = merge(this.stop$, this.gameEnded$);

  private get stop(): MonoTypeOperatorFunction<unknown> {
    return takeUntil(this.stopIncludingGameCompleted$);
  }

  constructor(
    readonly controller: SocketController,
    readonly game: Game,
    readonly stop$: Observable<unknown>,
    readonly lobbyController: SocketLobbyController
  ) {
    this.subscribeStatusChanged();
    this.subscribeRoundStarted();

    this.createControllerForLatestRound();
    this.emitScores();
  }

  createControllerForLatestRound() {
    if (!this.controller.inLobby) {
      this.lobbyController.emitLobbyUpdated();
    } else if (this.lobbyController.isOwnLobby) {
      this.lobbyController.emitLobbyStatus();
      if (this.game.rounds.length > 0) {
        new SocketRoundController(
          this.controller,
          this.game.rounds[this.game.rounds.length - 1],
          this.stop$,
          this
        );
      }
    }
  }

  emitLobbyInfo() {
    if (!this.controller.inLobby) {
      this.lobbyController.emitLobbyUpdated();
    } else if (this.lobbyController.lobby === this.controller.player.lobby) {
      this.lobbyController.emitLobbyStatus();
    }
  }

  emitScores() {
    this.controller.emit('scores', this.game.scores);
  }

  subscribeStatusChanged() {
    this.game.statusChanged$.pipe(this.stop).subscribe((status: GameStatus) => {
      if (status === GameStatus.COMPLETED || status === GameStatus.CANCELLED) {
        this.gameEnded$.next();
      }
      this.emitLobbyInfo();
    });
  }

  subscribeRoundStarted() {
    this.game.roundStarted$.pipe(this.stop).subscribe((round: Round) => {
      new SocketRoundController(this.controller, round, this.stop$, this);
    });
  }
}
