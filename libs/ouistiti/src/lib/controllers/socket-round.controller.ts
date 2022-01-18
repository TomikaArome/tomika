import { SocketController } from './socket.controller';
import { Round } from '../classes/round.class';
import { CardPlayed, KnownBidInfo, PlayedCardInfo, RoundStatusChanged, UnknownBidInfo } from '@TomikaArome/ouistiti-shared';
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
    this.subscribeBidPlaced();
    this.subscribeBidCancelled();
    this.subscribeCardPlayed();

    this.emitInitialRoundStatus();
  }

  emitInitialRoundStatus() {
    this.controller.emit('roundStatus', this.round.infoKnownToPlayer(this.controller.player.id));
  }

  subscribeStatusChanged() {
    this.round.statusChanged$.pipe(this.stop).subscribe((statusChanged: RoundStatusChanged) => {
      this.controller.emit('roundStatusChanged', statusChanged);
    });
  }

  subscribeBidPlaced() {
    this.round.bidPlaced$.pipe(this.stop).subscribe((knownBid: KnownBidInfo) => {
      if (knownBid.playerId === this.controller.player.id) {
        this.controller.emit('bid', knownBid);
      } else {
        const unknownBid: UnknownBidInfo = { playerId: knownBid.playerId, bidPending: false };
        this.controller.emit('bid', unknownBid);
      }
    });
  }

  subscribeBidCancelled() {
    this.round.bidCancelled$.pipe(this.stop).subscribe((playerId: string) => {
      const unknownBid: UnknownBidInfo = { playerId, bidPending: true };
      this.controller.emit('bid', unknownBid);
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
