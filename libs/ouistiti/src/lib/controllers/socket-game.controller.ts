import { merge, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SocketController } from './socket.controller';
import { Game } from '../classes/game.class';
import { GameStatus } from '@TomikaArome/ouistiti-shared';
import { Round } from '../classes/round.class';
import { SocketRoundController } from './socket-round.controller';
import { SocketLobbyController } from './socket-lobby.controller';

export class SocketGameController {
  gameCompleted$: Observable<unknown> = this.game.statusChanged$.pipe(
    filter((status: GameStatus) => status === GameStatus.COMPLETED || status === GameStatus.CANCELLED)
  );
  stopIncludingGameCompleted$ = merge(this.stop$, this.gameCompleted$);

  private get stop(): MonoTypeOperatorFunction<unknown> { return takeUntil(this.stopIncludingGameCompleted$); }

  constructor(readonly controller: SocketController,
              readonly game: Game,
              readonly stop$: Observable<unknown>,
              readonly lobbyController: SocketLobbyController) {
    this.subscribeStatusChanged();
    this.subscribeRoundStarted();

    this.createControllerForLatestRound();
  }

  createControllerForLatestRound() {
    if (!this.controller.inLobby) {
      this.lobbyController.emitLobbyUpdated();
    } else if (this.lobbyController.isOwnLobby) {
      this.lobbyController.emitLobbyStatus();
      if (this.game.rounds.length > 0) {
        new SocketRoundController(this.controller, this.game.rounds[this.game.rounds.length - 1], this.stop$, this);
      }
    }
  }

  subscribeStatusChanged() {
    this.game.statusChanged$.pipe(this.stop).subscribe((status: GameStatus) => {
      console.log('Game status changed', status);
    });
  }

  subscribeRoundStarted() {
    this.game.roundStarted$.pipe(this.stop).subscribe((round: Round) => {
      new SocketRoundController(this.controller, round, this.stop$, this);
    });
  }
}
