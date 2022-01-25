import { SocketController } from './socket.controller';
import { Round } from '../classes/round.class';
import { BidsChanged, CardPlayed, PlayedCardInfo, RoundStatus, RoundStatusChanged } from '@TomikaArome/ouistiti-shared';
import { merge, MonoTypeOperatorFunction, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardPlayedObserved } from '../interfaces/round-observed.interface';

export class SocketRoundController {
  private get stop(): MonoTypeOperatorFunction<unknown> { return takeUntil(this.stop$); }

  constructor(readonly controller: SocketController,
              readonly round: Round,
              readonly stop$: Observable<unknown>) {
    this.stop$ = merge(this.stop$, this.round.completed$);

    this.subscribeStatusChanged();
    this.subscribeEmitBidsChanged();
    this.subscribeCardPlayed();

    this.emitInitialRoundStatus();
  }

  emitInitialRoundStatus() {
    this.controller.emit('roundStatus', this.round.infoKnownToPlayer(this.controller.player.id));
  }

  subscribeStatusChanged() {
    this.round.statusChanged$.pipe(this.stop).subscribe((status: RoundStatus) => {
      if (status === RoundStatus.PLAY) {
        const payload: RoundStatusChanged = {
          status,
          bids: this.round.bids,
          breakPoint: this.round.breakPoint.info
        };
        this.controller.emit('roundStatusChanged', payload);
      } else if (status === RoundStatus.COMPLETED) {
        this.controller.emit('roundStatusChanged', { status });
      }
    });
  }

  subscribeEmitBidsChanged() {
    merge(
      this.round.bidPlaced$,
      this.round.bidCancelled$
    ).pipe(this.stop).subscribe(() => {
      const payload: BidsChanged = {
        bids: this.round.bidsKnownToPlayer(this.controller.player.id),
        breakPoint: this.round.breakPoint.info
      }
      this.controller.emit('bidsChanged', payload);
    });
  }

  subscribeCardPlayed() {
    this.round.cardPlayed$.pipe(this.stop).subscribe((observed: CardPlayedObserved) => {
      const payload: CardPlayed = {
        card: observed.card.info as PlayedCardInfo,
        nextPlayerId: observed.nextPlayerId
      };
      this.controller.emit('cardPlayed', payload);
    });
  }
}
