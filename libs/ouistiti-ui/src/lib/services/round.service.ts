import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { BehaviorSubject } from 'rxjs';
import { PlaceBidParams, BidsChanged, CardInfo, CardPlayed, RoundInfo, RoundStatus, RoundStatusChanged, NewTurnStarted, PlayCardParams, BreakPointInfo } from '@TomikaArome/ouistiti-shared';

@Injectable({ providedIn: 'root' })
export class RoundService {
  private currentRoundInfo: RoundInfo = SocketService.roundStatusInitialValue;

  private currentRoundInfoSource = new BehaviorSubject<RoundInfo>(SocketService.roundStatusInitialValue);
  currentRoundInfo$ = this.currentRoundInfoSource.asObservable();

  private static updateCardInfo(cards: CardInfo[], newCard: CardInfo) {
    const originalCardIndex = cards.findIndex((card: CardInfo) => card.id === newCard.id);
    if (originalCardIndex === -1) {
      cards.push(newCard);
    } else {
      Object.keys(cards[originalCardIndex]).forEach(key => delete cards[originalCardIndex][key]);
      Object.assign(cards[originalCardIndex], newCard);
    }
  }

  constructor(private socketService: SocketService) {
    this.listenToEvents();
  }

  listenToEvents() {
    this.socketService.getEvent<RoundInfo>('roundStatus').subscribe((payload: RoundInfo) => {
      this.currentRoundInfo = payload;
      this.currentRoundInfoSource.next(this.currentRoundInfo);
    });

    this.socketService.getEvent<BidsChanged>('bidsChanged').subscribe((payload: BidsChanged) => {
      this.currentRoundInfo.bids = payload.bids;
      this.currentRoundInfo.breakPoint = payload.breakPoint;
      this.currentRoundInfoSource.next(this.currentRoundInfo);
    });

    this.socketService.getEvent<CardPlayed>('cardPlayed').subscribe((payload: CardPlayed) => {
      this.currentRoundInfo.currentPlayerId = payload.nextPlayerId;
      payload.affectedCards.forEach((cardInfo: CardInfo) => RoundService.updateCardInfo(this.currentRoundInfo.cards, cardInfo));
      this.currentRoundInfo.breakPoint = payload.breakPoint;
    });

    this.socketService.getEvent<NewTurnStarted>('newTurnStarted').subscribe((payload: NewTurnStarted) => {
      this.currentRoundInfo.currentTurnNumber = payload.newTurnNumber;
      this.currentRoundInfo.currentPlayerId = payload.newTurnFirstPlayerId;
    });

    this.socketService.getEvent<RoundStatusChanged>('roundStatusChanged').subscribe((payload: RoundStatusChanged) => {
      this.currentRoundInfo.status = payload.status;
      if (payload.status === RoundStatus.PLAY) {
        this.currentRoundInfo.bids = payload.bids;
        this.currentRoundInfo.breakPoint = payload.breakPoint;
      }
      this.currentRoundInfoSource.next(this.currentRoundInfo);
    });

    this.socketService.getEvent<BreakPointInfo>('breakPointChanged').subscribe((payload: BreakPointInfo) => {
      this.currentRoundInfo.breakPoint = payload;
    });
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
