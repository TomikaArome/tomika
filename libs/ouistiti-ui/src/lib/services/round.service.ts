import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { BehaviorSubject } from 'rxjs';
import {
  BidsChanged,
  BreakPointInfo,
  CardInfo,
  CardPlayed,
  PlaceBidParams,
  PlayCardParams,
  RoundInfo,
  RoundStatus,
  RoundStatusChanged, roundStatusMock
} from '@TomikaArome/ouistiti-shared';

@Injectable({ providedIn: 'root' })
export class RoundService {
  private currentRoundInfo: RoundInfo = SocketService.roundStatusInitialValue;

  private currentRoundInfoSource = new BehaviorSubject<RoundInfo>(
    //roundStatusMock
    SocketService.roundStatusInitialValue
  );
  currentRoundInfo$ = this.currentRoundInfoSource.asObservable();

  constructor(private socketService: SocketService) {
    this.listenToEvents();
  }

  listenToEvents() {
    this.socketService
      .getEvent<RoundInfo>('roundInfo')
      .subscribe((payload: RoundInfo) => {
        console.log('roundInfo', payload);
        this.currentRoundInfo = payload;
        this.currentRoundInfoSource.next(this.currentRoundInfo);
      });

    this.socketService
      .getEvent<BidsChanged>('bidsChanged')
      .subscribe((payload: BidsChanged) => {
        this.currentRoundInfo.bids = payload.bids;
        this.currentRoundInfo.breakPoint = payload.breakPoint;
        this.currentRoundInfoSource.next(this.currentRoundInfo);
      });

    this.socketService
      .getEvent<CardPlayed>('cardPlayed')
      .subscribe((payload: CardPlayed) => {
        this.currentRoundInfo.breakPoint = payload.breakPoint;
        this.updateCardInfo(payload.affectedCard);
        this.currentRoundInfo.currentPlayerId = payload.nextPlayerId;
        this.currentRoundInfoSource.next(this.currentRoundInfo);
      });

    this.socketService
      .getEvent<RoundStatusChanged>('roundStatusChanged')
      .subscribe((payload: RoundStatusChanged) => {
        this.currentRoundInfo.status = payload.status;
        this.currentRoundInfo.breakPoint = payload.breakPoint ?? null;

        if (payload.status === RoundStatus.BIDDING) {
          this.currentRoundInfo = payload;
        } else if (payload.status === RoundStatus.PLAY) {
          this.currentRoundInfo.currentTurnNumber = payload.newTurnNumber;
          this.currentRoundInfo.currentPlayerId = payload.newTurnFirstPlayerId;
          this.currentRoundInfo.bids = payload.bids;
        } else if (payload.status === RoundStatus.END_OF_TURN) {
          payload.affectedCards.forEach((cardInfo: CardInfo) =>
            this.updateCardInfo(cardInfo)
          );
        }

        this.currentRoundInfoSource.next(this.currentRoundInfo);
      });

    this.socketService
      .getEvent<BreakPointInfo>('breakPointChanged')
      .subscribe((payload: BreakPointInfo) => {
        console.log(payload);
        this.currentRoundInfo.breakPoint = payload;
        this.currentRoundInfoSource.next(this.currentRoundInfo);
      });
  }

  private updateCardInfo(cardInfo: CardInfo) {
    const originalCardIndex = this.currentRoundInfo.cards.findIndex(
      (card: CardInfo) => card.id === cardInfo.id
    );
    if (originalCardIndex === -1) {
      this.currentRoundInfo.cards.push(cardInfo);
    } else {
      Object.keys(this.currentRoundInfo.cards[originalCardIndex]).forEach(
        (key) => delete this.currentRoundInfo.cards[originalCardIndex][key]
      );
      Object.assign(this.currentRoundInfo.cards[originalCardIndex], cardInfo);
    }
  }

  placeBid(bid: number) {
    const params: PlaceBidParams = { bid };
    this.socketService.emitEvent('placeBid', params);
  }

  cancelBid() {
    this.socketService.emitEvent('cancelBid');
  }

  playCard(cardId: string) {
    const params: PlayCardParams = { id: cardId };
    this.socketService.emitEvent('playCard', params);
  }

  acknowledgeBreakPoint() {
    this.socketService.emitEvent('acknowledgeBreakPoint');
  }
}
