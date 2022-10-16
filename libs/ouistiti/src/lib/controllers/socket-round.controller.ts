import { SocketController } from './socket.controller';
import { Round } from '../classes/round.class';
import { BidsChanged, BreakPointInfo, CardPlayed, RoundStatus, RoundStatusChanged, } from '@TomikaArome/ouistiti-shared';
import { merge, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketGameController } from './socket-game.controller';
import { Card } from '../classes/card.class';

export class SocketRoundController {
  private stopIncludingRoundCompleted$ = merge(
    this.stop$,
    this.round.completed$
  );

  private get stop(): MonoTypeOperatorFunction<unknown> {
    return takeUntil(this.stopIncludingRoundCompleted$);
  }

  constructor(readonly controller: SocketController,
              readonly round: Round,
              readonly stop$: Observable<unknown>,
              private gameController: SocketGameController) {
    this.subscribeStatusChanged();
    this.subscribeEmitBidsChanged();
    this.subscribeCardPlayed();
    this.subscribeBreakPointAcknowledged();
    this.subscribeGameSuspendedOrResumed();

    this.emitInitialRoundStatus();
  }

  emitInitialRoundStatus() {
    this.controller.emit(
      'roundInfo',
      this.round.infoKnownToPlayer(this.controller.player.id)
    );
  }

  subscribeStatusChanged() {
    this.round.statusChanged$
      .pipe(takeUntil(this.stop$))
      .subscribe((status: RoundStatus) => {
        let payload: RoundStatusChanged;

        switch (status) {
          case RoundStatus.BIDDING:
            payload = this.round.info as RoundStatusChanged;
            break;
          case RoundStatus.PLAY:
            payload = {
              status,
              breakPoint: this.round.breakPoint?.info ?? null,
              newTurnNumber: this.round.currentTurnNumber,
              newTurnFirstPlayerId: this.round.currentPlayerId,
              bids: this.round.bids,
            };
            break;
          case RoundStatus.END_OF_TURN:
            payload = {
              status,
              breakPoint: this.round.breakPoint?.info ?? null,
              affectedCards: this.round.cards
                .filter(
                  (card: Card) =>
                    card.playedOnTurn === this.round.currentTurnNumber
                )
                .map((card: Card) => card.info),
            };
            break;
          case RoundStatus.COMPLETED:
            payload = {
              status,
              breakPoint: this.round.breakPoint?.info ?? null,
              scores: this.gameController.game.scores,
            };
            break;
        }
        this.controller.emit('roundStatusChanged', payload);
      });
  }

  subscribeEmitBidsChanged() {
    merge(this.round.bidPlaced$, this.round.bidCancelled$)
      .pipe(this.stop)
      .subscribe(() => {
        const payload: BidsChanged = {
          bids: this.round.bidsKnownToPlayer(this.controller.player.id),
          breakPoint: this.round.breakPoint.info,
        };
        this.controller.emit('bidsChanged', payload);
      });
  }

  subscribeCardPlayed() {
    this.round.cardPlayed$.pipe(this.stop).subscribe((card: Card) => {
      if (this.round.status === RoundStatus.PLAY) {
        const cardPlayedPayload: CardPlayed = {
          breakPoint: this.round.breakPoint?.info ?? null,
          affectedCard: card.info,
          nextPlayerId: this.round.currentPlayerId,
        };
        this.controller.emit('cardPlayed', cardPlayedPayload);
      }
    });
  }

  subscribeBreakPointAcknowledged() {
    this.round.breakPointAcknowledged$
      .pipe(takeUntil(this.stop$))
      .subscribe(() => {
        const payload: BreakPointInfo = this.round.breakPoint.info;
        this.controller.emit('breakPointChanged', payload);
      });
  }

  subscribeGameSuspendedOrResumed() {
    this.gameController.game.statusChanged$.pipe(this.stop).subscribe(() => {
      if (this.round.breakPoint) {
        const payload: BreakPointInfo = this.round.breakPoint.info;
        this.controller.emit('breakPointChanged', payload);
      }
    });
  }
}
